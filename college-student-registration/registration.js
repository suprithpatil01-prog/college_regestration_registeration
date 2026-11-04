"use strict";

$(function () {
  const $form = $("#registration-form");
  const $age = $("#age");
  const $dob = $("#dob");
  const $usn = $("#usn");
  const $status = $("#age-status");

  function showError(id, message) {
    const errorId = (id === "student-name" ? "name" : id) + "-error";
    $("#" + id).attr("aria-invalid", message ? "true" : "false");
    $("#" + errorId).text(message);
  }

  function parseBirthDate(value) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec($.trim(value));
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (year < 1900 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date > today) return null;
    return date;
  }

  function ageOnDate(date) {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) age -= 1;
    return age;
  }

  function updateAgeStatus() {
    const value = $.trim($age.val());
    const age = Number(value);
    $status.removeClass("minor adult");
    if (!value || !Number.isInteger(age) || age < 1 || age > 100) {
      $status.html('<span class="status-icon">i</span><span>Enter an age to see the student’s status.</span>');
    } else if (age < 18) {
      $status.addClass("minor").html('<span class="status-icon">!</span><span><strong>Minor</strong> · Age ' + age + ' is under 18. Parent / guardian consent is required.</span>');
    } else {
      $status.addClass("adult").html('<span class="status-icon">✓</span><span><strong>Adult student</strong> · 18 years or older.</span>');
    }
  }

  function validateForm() {
    let valid = true;
    const name = $.trim($("#student-name").val());
    if (!name) { showError("student-name", "Enter the student’s full name."); valid = false; }
    else if (/\d/.test(name) || !/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(name)) { showError("student-name", "Numbers are not allowed in the student name."); valid = false; }
    else showError("student-name", "");

    const address = $.trim($("#address").val());
    if (!address) { showError("address", "Enter the student’s address."); valid = false; }
    else if (address.length > 200) { showError("address", "Address must be 200 characters or fewer."); valid = false; }
    else showError("address", "");

    const usn = $.trim($usn.val()).toUpperCase();
    $usn.val(usn);
    if (!/^\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/.test(usn)) { showError("usn", "USN must be exactly 10 characters in this format only, for example 2KE24CS164."); valid = false; }
    else showError("usn", "");

    const email = $.trim($("#email").val());
    const emailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,}$/i;
    const emailTld = email.includes(".") ? email.slice(email.lastIndexOf(".") + 1) : "";
    if (!emailPattern.test(email) || !/^[A-Za-z]{2,}$/.test(emailTld)) {
      showError("email", /\d/.test(emailTld) ? "Enter a valid email address. The ending must be letters only, such as .com." : "Enter a valid email address, such as name@gmail.com.");
      valid = false;
    } else showError("email", "");

    const phone = $.trim($("#phone").val()).replace(/[\s()-]/g, "").replace(/^\+91/, "");
    if (!/^[6-9]\d{9}$/.test(phone)) { showError("phone", "Enter a valid 10-digit Indian mobile number."); valid = false; }
    else showError("phone", "");

    if (!$("#course").val()) { showError("course", "Select a course."); valid = false; }
    else showError("course", "");

    const dobValue = $.trim($dob.val());
    const birthDate = parseBirthDate(dobValue);
    if (/^(30|31)\/02\/\d{4}$/.test(dobValue)) { showError("dob", "February does not have 30 or 31 days."); valid = false; }
    else if (!birthDate) { showError("dob", "Enter a real date in DD/MM/YYYY format."); valid = false; }
    else showError("dob", "");

    const ageValue = $.trim($age.val());
    const age = Number(ageValue);
    if (!ageValue || !Number.isInteger(age) || age < 1 || age > 100) { showError("age", "Enter a whole age from 1 to 100."); valid = false; }
    else if (birthDate && ageOnDate(birthDate) !== age) { showError("age", "Age does not match the date of birth."); valid = false; }
    else showError("age", "");

    updateAgeStatus();
    if (!valid) $form.find('[aria-invalid="true"]').first().trigger("focus");
    return valid;
  }

  $usn.on("input", function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    if (this.getAttribute("aria-invalid") === "true") showError("usn", "");
  });
  $age.on("input", updateAgeStatus);
  $dob.on("input", function () {
    if (!$age.val()) return;
    const date = parseBirthDate($dob.val());
    if (!date) return;
    if (Number($age.val()) !== ageOnDate(date)) showError("age", "Age does not match the date of birth.");
    else showError("age", "");
  });
  $form.on("input change", "input, select", function () {
    if (this.getAttribute("aria-invalid") === "true" && this.id !== "usn" && this.id !== "age" && this.id !== "dob") {
      const errorId = (this.id === "student-name" ? "name" : this.id) + "-error";
      $("#" + errorId).text("");
      $(this).attr("aria-invalid", "false");
    }
  });

  $form.on("submit", function (event) {
    if (!validateForm()) {
      event.preventDefault();
      return;
    }
    $form.find('[type="submit"]').prop("disabled", true).find("span:first").text("Submitting…");
  });

  $form.on("reset", function () {
    window.setTimeout(function () {
      $form.find("[aria-invalid]").attr("aria-invalid", "false");
      $form.find(".field-error").text("");
      updateAgeStatus();
    }, 0);
  });

  $("#search-records").on("input", function () {
    const query = $.trim(this.value).toLowerCase();
    let matches = 0;
    $("#records-table tbody tr").each(function () {
      const match = $(this).text().toLowerCase().includes(query);
      $(this).toggle(match);
      if (match && !$(this).hasClass("empty-row")) matches += 1;
    });
    $("#no-search-results").prop("hidden", matches > 0 || $("#records-table .empty-row").length > 0);
  });

  $("#export-button").on("click", function () {
    const rows = [["Student", "USN", "Course", "Age status", "Date added"]];
    $("#records-table tbody tr").not(".empty-row").each(function () {
      rows.push($(this).children("td").map(function () { return $.trim($(this).text()).replace(/\s+/g, " "); }).get());
    });
    if (rows.length === 1) { window.alert("There are no registrations to export in this session yet."); return; }
    const csv = rows.map(function (row) { return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(","); }).join("\r\n");
    const link = document.createElement("a");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    link.href = url;
    link.download = "kle-student-registrations.csv";
    link.click();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });

  updateAgeStatus();
});
