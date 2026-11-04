# Northstar College Student Registration

A responsive student registration website for the programming assignment, built with HTML, CSS, JavaScript, jQuery, and PHP. jQuery checks the form in the browser and PHP validates it again on the server. On successful submission, PHP displays a formatted registration receipt and adds the student to the recent-records table for the current session.

## Run locally

1. Install PHP 8.3 or later.
2. Open a terminal in this folder and run: php -S localhost:8000
3. Open http://localhost:8000 in a browser.

The page loads jQuery 3.7.1 and Google Fonts from their CDNs, so an internet connection is needed for those assets.

## Validation rules

- Names allow Unicode letters, spaces, apostrophes, periods, and hyphens. Names with numbers, such as Suprit6Gouda, are rejected.
- Email must have a valid format and an alphabetic domain ending. suprithgouda01@gmail.co8 is rejected. Format checks cannot confirm that a mailbox exists.
- Date of birth must be a real DD/MM/YYYY date and cannot be in the future. Dates such as 30 or 31 February are rejected.
- Age must be a whole number from 1 to 100 and must match the date of birth. Ages under 18 show **Minor**; ages 18 and above show **Adult**.
- USN is normalized to uppercase and must match digit + 2 letters + 2 digits + 2 letters + 3 digits, exactly 10 characters. Example: 2KE24CS164.
- Indian mobile format, selected course, and duplicate USNs in the current session are checked.

## Cloud deployment

The included Dockerfile prepares the app for a Docker-based cloud service. To deploy on Render, push the project folder to a Git repository, create a **Web Service**, choose **Docker**, and deploy the repository. Apache listens on port 10000 as expected by the Render service configuration. This ZIP is prepared for cloud deployment but is not published to a live URL.

## Storage

This class-project demo keeps records in a PHP session. The recent-records table and counts last for the current session; there is no permanent database. A real college system should use an access-controlled database.

## Project files

- index.php — registration form, server validation, session records, and formatted success result
- styles.css and php.css — page layout and styling
- registration.js — jQuery validation, age status, search, and CSV export
- Dockerfile — Docker setup for PHP cloud hosting
