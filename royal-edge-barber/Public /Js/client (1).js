/* =====================================================
   ROYAL EDGE CLIENT DASHBOARD
===================================================== */


/* =====================================================
   CUSTOMER DATA
===================================================== */

const customer = {
    name: "Melaku Melie",
    firstName: "Melaku",
    memberId: "RE-10245",
    referralId: "RE-MELAKU25",
    membership: "Gold",
    points: 2450
};
/* =====================================================
   ELEMENTS
===================================================== */

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("sidebarOverlay");

const mobileMenu =
    document.getElementById("mobileMenu");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* =====================================================
   PAGE INFORMATION
===================================================== */

const pageInformation = {

    overview: {
        title: "Overview",
        subtitle: "Welcome back to Royal Edge Barber"
    },

    profile: {
        title: "My Profile",
        subtitle: "Manage your personal information"
    },

    notifications: {
        title: "Notifications",
        subtitle: "Your latest Royal Edge updates"
    },
 book: {
        title: "Book a Haircut",
        subtitle: "Choose your service and preferred time"
    },

    appointments: {
        title: "My Appointments",
        subtitle: "Manage your Royal Edge bookings"
    },

    visits: {
        title: "Visit History",
        subtitle: "View your previous Royal Edge visits"
    },

    payments: {
        title: "Payment History",
        subtitle: "Track your payments and receipts"
    },
  referrals: {
        title: "Refer Friends",
        subtitle: "Invite friends and earn rewards"
    },

    membership: {
        title: "Membership Card",
        subtitle: "Your Royal Edge membership benefits"
    },

    rewards: {
        title: "Rewards & Points",
        subtitle: "Earn points and redeem rewards"
    },
   feedback: {
        title: "Feedback",
        subtitle: "Help us improve your experience"
    },

    settings: {
        title: "Settings",
        subtitle: "Manage your account preferences"
    }

};
/* =====================================================
   SHOW SECTION
===================================================== */

function showSection(sectionName) {

    const section =
        document.getElementById(sectionName);

    if (!section) {
        return;
    }
 /* Hide every section */

    document
        .querySelectorAll(".dashboard-section")
        .forEach(function(section) {

            section.classList.remove(
                "active-section"
            );

        });

    /* Show selected section */

    section.classList.add(
        "active-section"
    );


    /* Update sidebar */

    document
        .querySelectorAll(".nav-link")
        .forEach(function(link) {

            link.classList.remove("active");

            if (
                link.dataset.section === sectionName
            ) {

                link.classList.add("active");

            }
           });


    /* Update top title */

    if (pageInformation[sectionName]) {

        document.getElementById("pageTitle")
            .textContent =
            pageInformation[sectionName].title;

        document.getElementById("pageSubtitle")
            .textContent =
            pageInformation[sectionName].subtitle;

    }
  /* Close mobile sidebar */

    sidebar.classList.remove("open");

    overlay.classList.remove("show");


    /* Scroll to top */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
/* =====================================================
   NAVIGATION LINKS
===================================================== */

document
    .querySelectorAll("[data-section]")
    .forEach(function(element) {

        element.addEventListener("click", function(event) {

            event.preventDefault();

            const section =
                element.dataset.section;

            showSection(section);

        });

    });
/* =====================================================
   MOBILE MENU
===================================================== */

mobileMenu.addEventListener(
    "click",
    function() {

        sidebar.classList.add("open");

        overlay.classList.add("show");

    }
);


overlay.addEventListener(
    "click",
    function() {

        sidebar.classList.remove("open");

        overlay.classList.remove("show");

    }
);
/* =====================================================
   CUSTOMER NAME
===================================================== */

document.getElementById(
    "sideCustomerName"
).textContent = customer.firstName;


document.getElementById(
    "topCustomerName"
).textContent = customer.firstName;


document.getElementById(
    "welcomeName"
).textContent = customer.firstName;
/* =====================================================
   COPY REFERRAL
===================================================== */

function copyReferral() {

    const referralLink =
        "https://royaledge.example/register?ref="
        + customer.referralId;


    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {
       navigator.clipboard
            .writeText(referralLink)
            .then(function() {

                showToast(
                    "Referral link copied!"
                );

            });

    } else {

        showToast(
            "Your referral ID: "
            + customer.referralId
        );

    }

}

const copyReferralSmall =
    document.getElementById(
        "copyReferral"
    );

if (copyReferralSmall) {

    copyReferralSmall.addEventListener(
        "click",
        copyReferral
    );

}


const copyReferralLarge =
    document.getElementById(
        "copyReferralLarge"
    );
if (copyReferralLarge) {

    copyReferralLarge.addEventListener(
        "click",
        copyReferral
    );

}
/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer = setTimeout(
        function() {

            toast.classList.remove(
                "show"
            );
                 },
        3000
    );

}

/* =====================================================
   NOTIFICATIONS
===================================================== */

const markRead =
    document.getElementById("markRead");


if (markRead) {

    markRead.addEventListener(
        "click",
        function() {
            document
                .querySelectorAll(
                    ".notification.unread"
                )
                .forEach(function(notification) {

                    notification.classList.remove(
                        "unread"
                    );

                });


            const count =
                document.querySelector(
                    ".notification-count"
                );
             if (count) {

                count.textContent = "0";

            }


            const dot =
                document.querySelector(
                    ".top-notification-dot"
                );

            if (dot) {

                dot.style.display = "none";

            }
     showToast(
                "All notifications marked as read."
            );

        }
    );

}
/* =====================================================
   BOOKING FORM
===================================================== */

const bookingForm =
    document.getElementById(
        "bookingForm"
    );


if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const service =
                document.getElementById(
                    "service"
                ).value;
          
            if (!service) {

                showToast(
                    "Please select a service."
                );

                return;

            }


            showToast(
                "Appointment request submitted!"
            );


            bookingForm.reset();

        }
    );

}
/* =====================================================
   SET MINIMUM BOOKING DATE
===================================================== */

const bookingDate =
    document.getElementById(
        "bookingDate"
    );


if (bookingDate) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    bookingDate.min = today;

}
/* =====================================================
   FEEDBACK STAR RATING
===================================================== */

const stars =
    document.querySelectorAll(
        "#starRating button"
    );


let selectedRating = 0;


stars.forEach(function(star) {

    star.addEventListener(
        "click",
        function() {

            selectedRating =
                Number(
                    star.dataset.rating
                );
   stars.forEach(
                function(item) {

                    const rating =
                        Number(
                            item.dataset.rating
                        );


                    if (
                        rating <=
                        selectedRating
                    ) {

                        item.classList.add(
                            "active"
                        );

                    } else {

                        item.classList.remove(
                            "active"
                        );
                              }

                }
            );

        }
    );

});
/* =====================================================
   FEEDBACK FORM
===================================================== */

const feedbackForm =
    document.getElementById(
        "feedbackForm"
    );


if (feedbackForm) {

    feedbackForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (selectedRating === 0) {

                showToast(
                    "Please select a star rating."
                );
                  return;

            }


            showToast(
                "Thank you for your feedback!"
            );


            feedbackForm.reset();


            stars.forEach(
                function(star) {

                    star.classList.remove(
                        "active"
                    );

                }
            );
               selectedRating = 0;

        }
    );

}

/* =====================================================
   LOGOUT
===================================================== */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function() {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }
            /*
             * This removes the demo login state.
             *
             * When you connect your real backend,
             * replace this with your real logout
             * request/session handling.
             */

            localStorage.removeItem(
                "loggedIn"
            );


            localStorage.removeItem(
                "customer"
            );


            showToast(
                "Logging out..."
            );
         setTimeout(
                function() {

                    window.location.href =
                        "login.html";

                },
                800
            );

        }
    );

}
      


/* =====================================================
   DEMO LOGIN CHECK
===================================================== */

/*
 * IMPORTANT:
 *
 * For testing, this check is disabled.
 *
 * When your real login system is ready,
 * you can enable it:
 *
 *
 * if (localStorage.getItem("loggedIn") !== "true") {
 *
 *     window.location.href = "login.html";
 *
 * }
 *
 */
/* =====================================================
   EDIT PROFILE
===================================================== */

const editProfileBtn =
    document.getElementById(
        "editProfileBtn"
    );


if (editProfileBtn) {

    editProfileBtn.addEventListener(
        "click",
        function() {

            showToast(
                "Profile editing will open here."
            );

        }
    );
  }



/* =====================================================
   APPOINTMENT ACTIONS
===================================================== */

document
    .querySelectorAll(".danger-btn")
    .forEach(function(button) {

        if (
            button.textContent
                .toLowerCase()
                .includes("cancel")
        ) {

            button.addEventListener(
                "click",
                function() {
                   const answer =
                        confirm(
                            "Cancel this appointment?"
                        );


                    if (answer) {

                        showToast(
                            "Appointment cancelled."
                        );

                    }

                }
            );

        }

    });
/* =====================================================
   REWARD REDEEM BUTTONS
===================================================== */

document
    .querySelectorAll(".reward-item .outline-btn")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const reward =
                    button
                        .closest(".reward-item")
                        .querySelector("strong")
                        .textContent;
                  const answer =
                    confirm(
                        "Redeem " +
                        reward +
                        "?"
                    );


                if (answer) {

                    showToast(
                        reward +
                        " redemption requested."
                    );

                }

            }
        );

    });

/* =====================================================
   TAB BUTTONS
===================================================== */

document
    .querySelectorAll(".tab")
    .forEach(function(tab) {

        tab.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".tab")
                    .forEach(function(item) {

                        item.classList.remove(
                            "active"
                        );

                    });


                tab.classList.add("active");


                showToast(
                    tab.textContent.trim()
                    + " appointments selected."
                );

            }
        );

    });
/* =====================================================
   TOP NOTIFICATION BUTTON
===================================================== */

const topNotification =
    document.querySelector(
        ".top-icon"
    );


if (topNotification) {

    topNotification.addEventListener(
        "click",
        function() {

            showSection(
                "notifications"
            );

        }
    );

}



/* =====================================================
   PREVENT EMPTY DEMO LINKS
===================================================== */

document
    .querySelectorAll(
        'a[href="#"]'
    )
    .forEach(function(link) {

        link.addEventListener(
            "click",
             function(event) {

                event.preventDefault();

            }
        );

    });



/* =====================================================
   INITIALIZE
===================================================== */

showSection("overview");
