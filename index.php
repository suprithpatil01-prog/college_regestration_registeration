<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Kolkata');
session_start();

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function student_age(DateTimeImmutable $dob, DateTimeImmutable $today): int
{
    return $dob->diff($today)->y;
}

$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
$_SESSION['records'] ??= [];
$courses = ['Computer Science & Engineering', 'Information Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Business Administration', 'Commerce', 'Other'];
$values = ['name' => '', 'usn' => '', 'email' => '', 'phone' => '', 'course' => '', 'dob' => '', 'age' => '', 'address' => ''];
$errors = [];
$generalError = '';
$success = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($values as $key => $_) $values[$key] = trim((string)($_POST[$key] ?? ''));
    $values['usn'] = strtoupper($values['usn']);
    if (!hash_equals((string)$_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) {
        $generalError = 'Your form session expired. Refresh the page and try again.';
    } else {
        $values['name'] = trim(preg_replace('/\\s+/u', ' ', $values['name']) ?? $values['name']);
        if ($values['name'] === '') $errors['name'] = 'Enter the student’s full name.';
        elseif (preg_match('/\\d/u', $values['name'])) $errors['name'] = 'Numbers are not allowed in the student name.';
        elseif (!preg_match("/^[\\p{L}\\p{M}][\\p{L}\\p{M} .'-]*$/u", $values['name'])) $errors['name'] = 'Use letters only. Numbers are not allowed in the student name.';

        $values['address'] = trim(preg_replace('/\\s+/u', ' ', $values['address']) ?? $values['address']);
        if ($values['address'] === '') $errors['address'] = 'Enter the student’s address.';
        elseif (mb_strlen($values['address']) > 200) $errors['address'] = 'Address must be 200 characters or fewer.';

        if (!preg_match('/^\\d[A-Z]{2}\\d{2}[A-Z]{2}\\d{3}$/', $values['usn'])) $errors['usn'] = 'USN must be exactly 10 characters in this format only, for example 2KE24CS164.';
        else foreach ($_SESSION['records'] as $record) if ($record['usn'] === $values['usn']) { $errors['usn'] = 'This USN is already registered in this session.'; break; }

        $emailTld = '';
        if (preg_match('/\\.([A-Za-z0-9-]+)$/', $values['email'], $emailTldMatch)) $emailTld = $emailTldMatch[1];
        $emailPattern = '/^[A-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\\.)+[A-Z]{2,}$/iD';
        if ($values['email'] === '' || filter_var($values['email'], FILTER_VALIDATE_EMAIL) === false || !preg_match($emailPattern, $values['email']) || !preg_match('/^[A-Za-z]{2,}$/', $emailTld)) {
            $errors['email'] = ($emailTld !== '' && preg_match('/\\d/', $emailTld))
                ? 'Enter a valid email address. The ending must be letters only, such as .com.'
                : 'Enter a valid email address, such as student@example.com.';
        }

        $phone = preg_replace('/[\\s()-]/', '', $values['phone']) ?? '';
        if (str_starts_with($phone, '+91')) $phone = substr($phone, 3);
        if (!preg_match('/^[6-9]\\d{9}$/', $phone)) $errors['phone'] = 'Enter a valid 10-digit Indian mobile number.';
        if (!in_array($values['course'], $courses, true)) $errors['course'] = 'Select a course.';

        $dob = DateTimeImmutable::createFromFormat('!d/m/Y', $values['dob']);
        $dateErrors = DateTimeImmutable::getLastErrors();
        $validDob = $dob instanceof DateTimeImmutable
            && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
            && $dob->format('d/m/Y') === $values['dob'] && $dob->format('Y') >= '1900'
            && $dob <= new DateTimeImmutable('today');
        if (preg_match('/^(30|31)\\/02\\/\\d{4}$/', $values['dob'])) $errors['dob'] = 'February does not have 30 or 31 days.';
        elseif (!$validDob) $errors['dob'] = 'Enter a real date in DD/MM/YYYY format; future dates are not allowed.';

        $age = filter_var($values['age'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 100]]);
        if ($age === false) $errors['age'] = 'Enter a whole age from 1 to 100.';
        elseif ($validDob && student_age($dob, new DateTimeImmutable('today')) !== $age) $errors['age'] = 'Age does not match the date of birth.';

        if ($errors === []) {
            $success = ['name' => $values['name'], 'usn' => $values['usn'], 'email' => $values['email'], 'phone' => $phone, 'course' => $values['course'], 'dob' => $values['dob'], 'age' => (int)$age, 'address' => $values['address'], 'created' => date('d M Y, h:i A')];
            array_unshift($_SESSION['records'], $success);
            $_SESSION['records'] = array_slice($_SESSION['records'], 0, 20);
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            $values = ['name' => '', 'usn' => '', 'email' => '', 'phone' => '', 'course' => '', 'dob' => '', 'age' => '', 'address' => ''];
        }
    }
}

$records = $_SESSION['records'];
$adults = count(array_filter($records, static fn(array $record): bool => $record['age'] >= 18));
$minors = count(array_filter($records, static fn(array $record): bool => $record['age'] < 18));
$fieldError = static fn(string $key): string => h((string)($errors[$key] ?? ''));
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f7fb">
  <title>K.L.E. Institute of Technology · Student Registration</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="php.css">
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar" aria-label="Main navigation">
      <a class="brand" href="#main" aria-label="K.L.E. Institute of Technology home">
        <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 2.5 19.4 12l9.6 4-9.6 3.6L16 29.5l-3.5-9.9L3 16l9.5-4L16 2.5Z"/><circle cx="16" cy="16" r="3.2"/></svg></span>
        <span><strong>K.L.E.</strong><small>INSTITUTE OF TECHNOLOGY</small></span>
      </a>

      <div class="nav-caption">WORKSPACE</div>
      <nav class="side-nav">
        <a class="nav-item" href="#overview"><span class="nav-icon">⌂</span> Overview</a>
        <a class="nav-item active" href="#registration" aria-current="page"><span class="nav-icon">＋</span> Student registration</a>
        <a class="nav-item" href="#registrations"><span class="nav-icon">▤</span> Student records <span class="nav-count"><?= count($records) ?></span></a>
      </nav>

      <div class="sidebar-bottom">
        <div class="help-card">
          <div class="help-icon">✦</div>
          <strong>Need a hand?</strong>
          <p>Check the field tips while completing a registration.</p>
          <a href="#help">View quick guide <span>↗</span></a>
        </div>
        <div class="user-chip"><div class="avatar">AD</div><div><strong>Admissions Desk</strong><small>College administrator</small></div><span class="more">•••</span></div>
      </div>
    </aside>

    <main id="main" class="main-content">
      <header class="topbar">
        <div class="breadcrumbs"><span>Workspace</span><span class="crumb-sep">/</span><strong>Student registration</strong></div>
        <div class="topbar-right"><span class="session-pill"><span class="live-dot"></span> Admissions open</span><div class="top-avatar" aria-label="Admissions Desk">AD</div></div>
      </header>

      <div class="page-wrap">
        <section id="overview" class="page-heading">
          <div>
            <div class="eyebrow"><span class="eyebrow-line"></span> ADMISSIONS · 2026–27</div>
            <h1>Student registration</h1>
            <p class="subtitle">Create a student record and keep your admissions list up to date.</p>
          </div>
          <button id="export-button" class="button button-light" type="button" title="Download saved records as a CSV file"><span class="download-icon">↓</span> Export records</button>
        </section>

        <section class="stats-grid" aria-label="Registration summary">
          <article class="stat-card"><div class="stat-top"><span>Total registrations</span><span class="stat-icon violet">▤</span></div><div class="stat-value"><?= count($records) ?></div><div class="stat-foot"><span class="stat-dot violet-dot"></span>Current browser session</div></article>
          <article class="stat-card"><div class="stat-top"><span>Adult students</span><span class="stat-icon green">↗</span></div><div class="stat-value"><?= $adults ?></div><div class="stat-foot"><span class="stat-dot green-dot"></span>Age 18 and above</div></article>
          <article class="stat-card"><div class="stat-top"><span>Minor students</span><span class="stat-icon amber">♡</span></div><div class="stat-value"><?= $minors ?></div><div class="stat-foot"><span class="stat-dot amber-dot"></span>Under age 18</div></article>
        </section>

        <?php if ($success !== null): ?>
        <section class="success-receipt" aria-live="polite"><div class="receipt-icon">✓</div><div class="receipt-content"><div class="receipt-kicker">REGISTRATION COMPLETE</div><h2><?= h($success['name']) ?> has been registered</h2><p>The submitted student details are shown below and added to this session’s recent records.</p><div class="receipt-grid"><div><small>USN</small><strong><?= h($success['usn']) ?></strong></div><div><small>COURSE</small><strong><?= h($success['course']) ?></strong></div><div><small>AGE STATUS</small><strong class="<?= $success['age'] < 18 ? 'minor-text' : 'adult-text' ?>"><?= $success['age'] ?> · <?= $success['age'] < 18 ? 'Minor' : 'Adult' ?></strong></div><div><small>EMAIL</small><strong><?= h($success['email']) ?></strong></div><div class="receipt-full"><small>ADDRESS</small><strong><?= h($success['address']) ?></strong></div></div></div></section>
        <?php endif; ?>
        <?php if ($generalError !== ''): ?><div class="server-alert" role="alert"><?= h($generalError) ?></div><?php endif; ?>

        <div class="content-grid">
          <section id="registration" class="panel form-panel">
            <div class="panel-heading">
              <div class="panel-title-wrap"><span class="step-number">01</span><div><h2>Student details</h2><p>Enter the student's personal and academic information.</p></div></div>
              <span class="required-note"><i>*</i> Required fields</span>
            </div>

            <form id="registration-form" method="post" action="index.php#registration" novalidate>
              <input type="hidden" name="csrf" value="<?= h((string)$_SESSION['csrf']) ?>">
              <div class="form-grid">
                <div class="field field-span-2">
                  <label for="student-name">Full name <span class="required-star">*</span></label>
                  <input id="student-name" name="name" type="text" autocomplete="name" placeholder="e.g. xyz" maxlength="80" value="<?= h($values['name']) ?>" required aria-describedby="name-hint name-error">
                  <div class="field-foot"><small id="name-hint">Use letters, spaces, apostrophes or hyphens.</small><small id="name-error" class="field-error"><?= $fieldError('name') ?></small></div>
                </div>

                <div class="field field-span-2">
                  <label for="address">Address <span class="required-star">*</span></label>
                  <textarea id="address" name="address" placeholder="e.g. 12, 3rd Cross, Jayanagar, Bengaluru – 560041" maxlength="200" rows="2" required aria-describedby="address-hint address-error"><?= h($values['address']) ?></textarea>
                  <div class="field-foot"><small id="address-hint">House / building, street, city and PIN code.</small><small id="address-error" class="field-error"><?= $fieldError('address') ?></small></div>
                </div>

                <div class="field">
                  <label for="usn">University Seat Number (USN) <span class="required-star">*</span></label>
                  <div class="input-with-prefix"><span class="prefix-icon">#</span><input id="usn" name="usn" type="text" placeholder="2KE24CS164" maxlength="10" autocapitalize="characters" spellcheck="false" value="<?= h($values['usn']) ?>" required aria-describedby="usn-hint usn-error"></div>
                  <div class="field-foot"><small id="usn-hint">10 characters: 1 digit · 2 letters · 2 digits · 2 letters · 3 digits.</small><small id="usn-error" class="field-error"><?= $fieldError('usn') ?></small></div>
                </div>

                <div class="field">
                  <label for="email">Student email <span class="required-star">*</span></label>
                  <div class="input-with-prefix"><span class="prefix-icon">@</span><input id="email" name="email" type="email" autocomplete="email" placeholder="student@example.com" maxlength="254" value="<?= h($values['email']) ?>" required aria-describedby="email-hint email-error"></div>
                  <div class="field-foot"><small id="email-hint">Enter a correctly formatted email address.</small><small id="email-error" class="field-error"><?= $fieldError('email') ?></small></div>
                </div>

                <div class="field">
                  <label for="phone">Mobile number <span class="required-star">*</span></label>
                  <div class="input-with-prefix"><span class="prefix-text">+91</span><input id="phone" name="phone" type="tel" autocomplete="tel-national" placeholder="98765 43210" maxlength="16" value="<?= h($values['phone']) ?>" required aria-describedby="phone-hint phone-error"></div>
                  <div class="field-foot"><small id="phone-hint">10-digit Indian mobile number.</small><small id="phone-error" class="field-error"><?= $fieldError('phone') ?></small></div>
                </div>

                <div class="field">
                  <label for="course">Course <span class="required-star">*</span></label>
                  <div class="select-wrap"><select id="course" name="course" required aria-describedby="course-error"><option value="">Select a course</option><?php foreach ($courses as $course): ?><option value="<?= h($course) ?>" <?= $values['course'] === $course ? 'selected' : '' ?>><?= h($course) ?></option><?php endforeach; ?></select></div>
                  <div class="field-foot"><small>&nbsp;</small><small id="course-error" class="field-error"><?= $fieldError('course') ?></small></div>
                </div>

                <div class="field">
                  <label for="dob">Date of birth <span class="required-star">*</span></label>
                  <div class="input-with-prefix"><span class="prefix-icon">▦</span><input id="dob" name="dob" type="text" inputmode="numeric" autocomplete="bday" placeholder="DD/MM/YYYY" maxlength="10" value="<?= h($values['dob']) ?>" required aria-describedby="dob-hint dob-error"></div>
                  <div class="field-foot"><small id="dob-hint">Use DD/MM/YYYY, for example 14/08/2008.</small><small id="dob-error" class="field-error"><?= $fieldError('dob') ?></small></div>
                </div>

                <div class="field">
                  <label for="age">Age (years) <span class="required-star">*</span></label>
                  <div class="input-with-suffix"><input id="age" name="age" type="number" inputmode="numeric" min="1" max="100" step="1" placeholder="e.g. 18" value="<?= h($values['age']) ?>" required aria-describedby="age-hint age-error"><span class="suffix-text">years</span></div>
                  <div class="field-foot"><small id="age-hint">Must match the date of birth above.</small><small id="age-error" class="field-error"><?= $fieldError('age') ?></small></div>
                </div>
              </div>

              <div id="age-status" class="age-status" aria-live="polite"><span class="status-icon">i</span><span>Enter an age to see the student's status.</span></div>

              <div class="form-actions"><button class="button button-primary" type="submit"><span>Save student registration</span><span class="button-arrow">→</span></button><button class="button button-quiet" type="reset">Clear form</button></div>
            </form>
          </section>

          <aside class="right-column">
            <section id="help" class="panel guide-panel">
              <div class="guide-heading"><span class="guide-mark">✦</span><div><h2>Quick guide</h2><p>A few checks before you save</p></div></div>
              <ul class="guide-list">
                <li><span class="guide-check">✓</span><span><strong>Name</strong><small>Numbers aren't accepted in the name field.</small></span></li>
                <li><span class="guide-check">✓</span><span><strong>Email</strong><small>Incorrect endings such as .co8 are rejected.</small></span></li>
                <li><span class="guide-check">✓</span><span><strong>Date of birth</strong><small>Calendar dates are checked, including leap years.</small></span></li>
                <li><span class="guide-check">✓</span><span><strong>USN</strong><small>Exactly 10 characters in the college format.</small></span></li>
              </ul>
              <div class="guide-note"><span>ⓘ</span><p>Age under 18 is marked <strong>Minor</strong>. Follow your college’s guardian consent process.</p></div>
            </section>

            <section class="tip-card">
              <div class="tip-sparkle">✦</div><div class="tip-label">GOOD TO KNOW</div>
              <p>USNs are saved in uppercase so student records stay consistent.</p>
              <span class="tip-decoration" aria-hidden="true">✳</span>
            </section>
          </aside>
        </div>

        <section id="registrations" class="panel records-panel">
          <div class="records-heading"><div><div class="records-title-line"><span class="step-number">02</span><h2>Recent registrations</h2><span class="count-badge"><?= count($records) ?></span></div><p>Records from this browser session. They clear when the session ends.</p></div><label class="search-box"><span>⌕</span><input id="search-records" type="search" placeholder="Search name or USN" aria-label="Search registrations"></label></div>
          <div class="table-wrap"><table id="records-table"><thead><tr><th>STUDENT</th><th>USN</th><th>COURSE</th><th>ADDRESS</th><th>AGE STATUS</th><th>DATE ADDED</th></tr></thead><tbody>
            <?php if ($records === []): ?><tr class="empty-row"><td colspan="6"><div class="empty-state"><span class="empty-icon">▤</span><strong>No registrations yet</strong><small>Submitted students will appear here for this session.</small></div></td></tr><?php else: foreach (array_slice($records, 0, 8) as $record): ?>
            <tr><td><div class="student-cell"><span class="student-initial"><?= h(strtoupper(substr($record['name'], 0, 1))) ?></span><span><?= h($record['name']) ?><small class="student-email"><?= h($record['email']) ?></small></span></div></td><td><span class="usn-pill"><?= h($record['usn']) ?></span></td><td><?= h($record['course']) ?></td><td class="record-address"><?= h($record['address']) ?></td><td><span class="status-badge <?= $record['age'] < 18 ? 'minor' : 'adult' ?>"><?= (int)$record['age'] ?> · <?= $record['age'] < 18 ? 'Minor' : 'Adult' ?></span></td><td><?= h($record['created']) ?></td></tr>
            <?php endforeach; endif; ?>
          </tbody></table></div>
          <div id="no-search-results" class="no-results" hidden>No student records match your search.</div>
        </section>

        <footer class="footer"><span>© 2026 K.L.E. Institute of Technology · Admissions workspace</span><span><span class="secure-dot"></span> Records are held in this browser session</span></footer>
      </div>
    </main>
  </div>
  <script src="jquery-3.7.1.min.js"></script>
  <script>window.jQuery || document.write('<script src="https://code.jquery.com/jquery-3.7.1.min.js"><\/script>')</script>
  <script src="registration.js"></script>
</body>
</html>
