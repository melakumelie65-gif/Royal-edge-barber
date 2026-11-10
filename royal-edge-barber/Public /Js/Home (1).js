/* =================================
   SHOW SIGNUP
================================= */

function showSignup(event) {

    if (event) {
        event.preventDefault();
    }

    document
        .getElementById("loginSection")
        .classList.remove("active");

    document
        .getElementById("signupSection")
        .classList.add("active");
}


/* =================================
   SHOW LOGIN
================================= */

function showLogin(event) {

    if (event) {
        event.preventDefault();
    }

    document
        .getElementById("signupSection")
        .classList.remove("active");

    document
        .getElementById("loginSection")
        .classList.add("active");
}


/* =================================
   SHOW / HIDE PASSWORD
================================= */

function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    const icon = button.querySelector("i");

    if (input.type === "password") {

        input.type = "text";

        icon.classList.remove("fa-eye");

        icon.classList.add("fa-eye-slash");

    } else {

        input.type = "password";

        icon.classList.remove("fa-eye-slash");

        icon.classList.add("fa-eye");
    }
}


/* =================================
   MESSAGE FUNCTION
================================= */

function showMessage(message) {

    const box = document.getElementById("messageBox");

    box.textContent = message;

    box.style.display = "block";

    setTimeout(function () {

        box.style.display = "none";

    }, 3000);
}


/* =================================
   SIGNUP
================================= */

document
    .getElementById("signupForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("fullName").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        /* CHECK PASSWORD */

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters."
            );

            return;
        }


        /* CHECK CONFIRM PASSWORD */

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match."
            );

            return;
        }


        /* PHONE CHECK */

        if (phone.length < 9) {

            showMessage(
                "Please enter a valid phone number."
            );

            return;
        }


        /* SUCCESS */

        showMessage(
            "Account created successfully!"
        );


        console.log("New customer:", {
            name: name,
            phone: phone
        });


        /*
         * Later you can connect this section
         * to your database/backend.
         */

    });



/* =================================
   LOGIN
================================= */

document
    .getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const phone =
            document.getElementById("loginPhone").value.trim();

        const id =
            document.getElementById("loginId").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        if (phone === "" || id === "" || password === "") {

            showMessage(
                "Please fill in all login fields."
            );

            return;
        }


        /*
         * This is only frontend validation.
         * A real login system requires a backend/database.
         */

        showMessage(
            "Login information submitted."
        );

    });



/* =================================
   FORGOT PASSWORD
================================= */

function forgotPassword(event) {

    event.preventDefault();

    const phone = prompt(
        "Enter your registered phone number:"
    );

    if (!phone) {
        return;
    }

    showMessage(
        "Password recovery request received."
    );

    /*
     * Later connect this to:
     * SMS / OTP / backend password reset.
     */

}