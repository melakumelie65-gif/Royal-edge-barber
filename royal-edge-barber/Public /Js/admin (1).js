/* =========================================================
   ROYAL EDGE — ADMIN DASHBOARD SCRIPT
   Handles: navigation, sections, tabs, toast, forms,
            modals, copy, mobile sidebar, storage.
   ========================================================= */

(function () {
    'use strict';

    /* =====================================================
       1. CONFIG & STATE
    ===================================================== */
    const STATE = {
        activeSection: 'overview',
        activeAppointmentTab: 'pending',
        activeBarberTab: 'pending',
        rating: 0,
        sidebarOpen: false,
        toastTimer: null
    };

    const SECTION_META = {
        overview:      { title: 'Overview',              subtitle: 'Manage Royal Edge operations' },
        appointments:  { title: 'Appointments',          subtitle: 'Review and manage all appointments' },
        customers:     { title: 'Customers',             subtitle: 'View and manage Royal Edge customers' },
        barbers:       { title: 'Barbers',               subtitle: 'Manage your barbers and shifts' },
        services:      { title: 'Services & Pricing',    subtitle: 'Manage the Royal Edge service catalog' },
        payments:      { title: 'Payments',              subtitle: 'Track all transactions and revenue' },
        rewards:       { title: 'Rewards Management',    subtitle: 'Configure rewards and points rules' },
        memberships:   { title: 'Memberships',           subtitle: 'Manage membership tiers' },
        feedback:      { title: 'Customer Feedback',     subtitle: 'Read and respond to feedback' },
        notifications: { title: 'Notifications',         subtitle: 'System and customer activity' },
        reports:       { title: 'Reports',               subtitle: 'Business insights and analytics' },
        settings:      { title: 'Settings',              subtitle: 'Manage admin and business settings' }
    };

    /* =====================================================
       2. DOM CACHE
    ===================================================== */
    const DOM = {
        body:               document.body,
        sidebar:            document.getElementById('sidebar'),
        sidebarOverlay:     document.getElementById('sidebarOverlay'),
        mobileMenu:         document.getElementById('mobileMenu'),
        logoutBtn:          document.getElementById('logoutBtn'),
        navLinks:           document.querySelectorAll('.nav-link'),
        sections:           document.querySelectorAll('.dashboard-section'),
        pageTitle:          document.getElementById('pageTitle'),
        pageSubtitle:       document.getElementById('pageSubtitle'),
        toast:              document.getElementById('toast'),
        toastMessage:       document.getElementById('toastMessage')
    };

    /* =====================================================
       3. UTILITIES
    ===================================================== */
    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /**
     * Show a toast message.
     * @param {string} message
     * @param {number} duration ms
     */
    function showToast(message, duration = 2800) {
        if (!DOM.toast || !DOM.toastMessage) return;
        DOM.toastMessage.textContent = message;
        DOM.toast.classList.add('show');

        clearTimeout(STATE.toastTimer);
        STATE.toastTimer = setTimeout(() => {
            DOM.toast.classList.remove('show');
        }, duration);
    }

    /**
     * Copy text to clipboard with fallback.
     */
    async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers / non-HTTPS
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            showToast(successMessage);
            return true;
        } catch (err) {
            console.error('Copy failed:', err);
            showToast('Could not copy. Please try again.');
            return false;
        }
    }

    /**
     * Format today's date as YYYY-MM-DD for date input min.
     */
    function todayISO() {
        const d = new Date();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${m}-${day}`;
    }

    /* =====================================================
       4. NAVIGATION & SECTION SWITCHING
    ===================================================== */
    function switchSection(sectionId) {
        if (!sectionId || !SECTION_META[sectionId]) return;

        // Update nav links
        DOM.navLinks.forEach(link => {
            const isActive = link.dataset.section === sectionId;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        // Update sections
        DOM.sections.forEach(sec => {
            sec.classList.toggle('active-section', sec.id === sectionId);
        });

        // Update page heading
        const meta = SECTION_META[sectionId];
        if (DOM.pageTitle)    DOM.pageTitle.textContent    = meta.title;
        if (DOM.pageSubtitle) DOM.pageSubtitle.textContent = meta.subtitle;

        // Update hash
        if (window.location.hash !== `#${sectionId}`) {
            history.replaceState(null, '', `#${sectionId}`);
        }

        // Save
        STATE.activeSection = sectionId;
        localStorage.setItem('re_admin_section', sectionId);

        // Close mobile sidebar
        closeSidebar();

        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* =====================================================
       5. MOBILE SIDEBAR
    ===================================================== */
    function openSidebar() {
        DOM.sidebar?.classList.add('open');
        DOM.sidebarOverlay?.classList.add('active');
        DOM.mobileMenu?.setAttribute('aria-expanded', 'true');
        STATE.sidebarOpen = true;
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        DOM.sidebar?.classList.remove('open');
        DOM.sidebarOverlay?.classList.remove('active');
        DOM.mobileMenu?.setAttribute('aria-expanded', 'false');
        STATE.sidebarOpen = false;
        document.body.style.overflow = '';
    }

    function toggleSidebar() {
        STATE.sidebarOpen ? closeSidebar() : openSidebar();
    }

    /* =====================================================
       6. TABS (generic handler)
    ===================================================== */
    function initTabs() {
        $$('.tabs').forEach(tabGroup => {
            const tabs = $$('.tab', tabGroup);

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => {
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');

                    // Hook: filter table by tab label
                    const label = tab.textContent.trim().toLowerCase();
                    filterByStatus(tabGroup, label);
                });
            });
        });
    }

    /**
     * Filter table rows in the same section by status text.
     */
    function filterByStatus(tabGroup, status) {
        const section = tabGroup.closest('.dashboard-section');
        if (!section) return;

        const rows = $$('tbody tr', section);
        if (!rows.length) return;

        let visibleCount = 0;
        rows.forEach(row => {
            const statusCell = row.querySelector('.status');
            if (!statusCell) {
                row.style.display = '';
                visibleCount++;
                return;
            }
            const text = statusCell.textContent.trim().toLowerCase();
            const match = status === 'all' || text.includes(status);
            row.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

        // Show empty state if none match
        showEmptyState(section, visibleCount === 0);
    }

    function showEmptyState(section, show) {
        const tbody = section.querySelector('tbody');
        if (!tbody) return;

        let emptyRow = tbody.querySelector('.empty-row');

        if (show) {
            if (!emptyRow) {
                emptyRow = document.createElement('tr');
                emptyRow.className = 'empty-row';
                emptyRow.innerHTML = `
                    <td colspan="8" style="text-align:center; padding:40px 20px; color: var(--text-muted);">
                        <i class="fa-solid fa-inbox" style="font-size: 2rem; opacity: 0.4; display:block; margin-bottom:10px;"></i>
                        No records found for this filter.
                    </td>
                `;
                tbody.appendChild(emptyRow);
            }
        } else if (emptyRow) {
            emptyRow.remove();
        }
    }

    /* =====================================================
       7. STAR RATING (feedback)
    ===================================================== */
    function initStarRating() {
        const starsContainer = $('#starRating');
        if (!starsContainer) return;

        const stars = $$('button', starsContainer);

        stars.forEach((star, idx) => {
            star.addEventListener('click', () => {
                STATE.rating = idx + 1;
                updateStarUI(stars, STATE.rating);
            });

            star.addEventListener('mouseenter', () => {
                updateStarUI(stars, idx + 1, true);
            });
        });

        starsContainer.addEventListener('mouseleave', () => {
            updateStarUI(stars, STATE.rating);
        });
    }

    function updateStarUI(stars, count, isHover = false) {
        stars.forEach((s, i) => {
            const active = i < count;
            s.style.color = active ? 'var(--gold)' : 'rgba(255,255,255,0.18)';
            s.style.transform = active && isHover ? 'scale(1.15)' : 'scale(1)';
            s.setAttribute('aria-checked', active && i === count - 1 ? 'true' : 'false');
        });
    }

    /* =====================================================
       8. FORMS
    ===================================================== */
    function initForms() {
        // Set minimum date for all date inputs to today
        const today = todayISO();
        $$('input[type="date"]').forEach(input => {
            input.min = today;
        });

        // Feedback form
        const feedbackForm = $('#feedbackForm');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', handleFeedbackSubmit);
        }

        // Any booking-style form (if added later)
        const bookingForm = $('#bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', handleBookingSubmit);
        }
    }

    function handleFeedbackSubmit(e) {
        e.preventDefault();

        const topic  = $('#feedbackTopic')?.value.trim() || '';
        const text   = $('#feedbackText')?.value.trim() || '';

        if (!STATE.rating) {
            showToast('Please select a star rating.');
            return;
        }
        if (!text) {
            showToast('Please write your feedback.');
            return;
        }

        // Simulate submit
        showToast('Thank you! Your feedback was submitted.');
        e.target.reset();
        STATE.rating = 0;
        updateStarUI($$('#starRating button'), 0);

        // Hide/replace previous feedback? Just log for now.
        console.log('Feedback submitted:', { rating: STATE.rating || 'N/A', topic, text });
    }

    function handleBookingSubmit(e) {
        e.preventDefault();
        showToast('Appointment booked successfully!');
        e.target.reset();
    }

    /* =====================================================
       9. TABLE ACTION BUTTONS (Confirm / Cancel / Edit / etc.)
    ===================================================== */
    function initTableActions() {
        // Delegate click on document
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            // Confirm buttons in tables
            if (btn.classList.contains('gold-btn') && btn.textContent.trim() === 'Confirm') {
                handleAppointmentAction(btn, 'confirm');
                return;
            }

            // Reject / Cancel buttons
            if (btn.classList.contains('danger-btn')) {
                const text = btn.textContent.trim();
                if (text === 'Cancel' || text === 'Reject') {
                    handleAppointmentAction(btn, 'cancel');
                    return;
                }
                if (text === 'Delete' || text === 'Suspend') {
                    handleDestructiveAction(btn);
                    return;
                }
                if (text === 'Reset') {
                    handleDestructiveAction(btn, 'System data reset confirmation required.');
                    return;
                }
            }

            // Reschedule
            if (btn.classList.contains('outline-btn') && btn.textContent.trim() === 'Reschedule') {
                showToast('Opening reschedule dialog…');
                // In real app, open a modal here
                return;
            }

            // Edit / View (row-level)
            if (btn.classList.contains('outline-btn')) {
                const text = btn.textContent.trim();
                if (text === 'Edit' || text === 'View') {
                    showToast(`${text} — feature coming soon.`);
                    return;
                }
            }

            // Redeem (rewards)
            if (btn.classList.contains('outline-btn') && btn.textContent.trim() === 'Redeem') {
                showToast('Reward redeemed! Points deducted.');
                btn.disabled = true;
                btn.textContent = 'Redeemed';
                return;
            }
        });
    }

    function handleAppointmentAction(btn, action) {
        const row = btn.closest('tr');
        if (!row) return;

        const statusCell = row.querySelector('.status');
        const customer   = row.cells[2]?.textContent.trim() || 'customer';

        if (action === 'confirm') {
            if (statusCell) {
                statusCell.className = 'status confirmed';
                statusCell.textContent = 'Confirmed';
            }
            // Replace action buttons
            const actionsCell = row.cells[row.cells.length - 1];
            if (actionsCell) {
                actionsCell.innerHTML = `
                    <button class="outline-btn" type="button">Reschedule</button>
                    <button class="danger-btn" type="button">Cancel</button>
                `;
            }
            showToast(`Appointment for ${customer} confirmed.`);
        }

        if (action === 'cancel') {
            if (statusCell) {
                statusCell.className = 'status pending';
                statusCell.textContent = 'Cancelled';
            }
            row.style.opacity = '0.5';
            showToast(`Appointment for ${customer} cancelled.`);
        }
    }

    function handleDestructiveAction(btn, customMsg) {
        const row = btn.closest('tr');
        const name = row?.cells[0]?.textContent.trim() || 'this record';
        const msg = customMsg || `Are you sure you want to remove ${name}?`;

        if (window.confirm(msg)) {
            if (row) {
                row.style.transition = 'opacity 0.3s, transform 0.3s';
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                setTimeout(() => row.remove(), 300);
            }
            showToast('Action completed.');
        }
    }

    /* =====================================================
       10. COPY REFERRAL
    ===================================================== */
    function initCopyButtons() {
        const copySmall = $('#copyReferral');
        const copyLarge = $('#copyReferralLarge');

        const REFERRAL_ID = 'RE-MELAKU25';

        copySmall?.addEventListener('click', () => {
            copyToClipboard(REFERRAL_ID, `Referral ID "${REFERRAL_ID}" copied!`);
        });

        copyLarge?.addEventListener('click', () => {
            const link = `${window.location.origin}${window.location.pathname}?ref=${REFERRAL_ID}`;
            copyToClipboard(link, 'Referral link copied!');
        });
    }

    /* =====================================================
       11. NOTIFICATIONS
    ===================================================== */
    function initNotifications() {
        const markReadBtn = $('#markRead');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => {
                const unread = $$('.notification.unread');
                if (!unread.length) {
                    showToast('No unread notifications.');
                    return;
                }
                unread.forEach(n => n.classList.remove('unread'));
                // Remove sidebar count
                const countBadge = $('.sidebar-nav .notification-count');
                if (countBadge) countBadge.remove();
                // Hide dot in topbar
                const dot = $('.top-notification-dot');
                if (dot) dot.style.display = 'none';
                showToast('All notifications marked as read.');
            });
        }

        // Click notification to mark as read
        $$('.notification').forEach(n => {
            n.addEventListener('click', () => {
                n.classList.remove('unread');
            });
        });
    }

    /* =====================================================
       12. QUICK ACTION BUTTONS
    ===================================================== */
    function initQuickActions() {
        // Add customer buttons
        ['addCustomerBtn', 'addCustomerTopBtn'].forEach(id => {
            const btn = document.getElementById(id);
            btn?.addEventListener('click', () => {
                showToast('Add customer form — coming soon.');
                // Or open modal
            });
        });

        // Add barber
        $('#addBarberBtn')?.addEventListener('click', () => {
            showToast('Add barber form — coming soon.');
        });

        // Add service
        $('#addServiceBtn')?.addEventListener('click', () => {
            showToast('Add service form — coming soon.');
        });

        // Add reward
        $('#addRewardBtn')?.addEventListener('click', () => {
            showToast('Add reward form — coming soon.');
        });

        // New appointment
        $('#newAppointmentBtn')?.addEventListener('click', () => {
            showToast('New appointment form — coming soon.');
        });

        // Edit profile / account settings
        $('#editProfileBtn')?.addEventListener('click', () => {
            showToast('Profile editor — coming soon.');
        });

        // Logout
        DOM.logoutBtn?.addEventListener('click', () => {
            if (window.confirm('Are you sure you want to log out?')) {
                showToast('Logging out…');
                setTimeout(() => {
                    // window.location.href = '/login';
                    console.log('→ Redirect to login');
                }, 800);
            }
        });
    }

    /* =====================================================
       13. TOGGLE SWITCHES (Settings)
    ===================================================== */
    function initSwitches() {
        $$('.switch input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', () => {
                const label = input.closest('.setting-row')?.querySelector('h3')?.textContent.trim() || 'Setting';
                const status = input.checked ? 'enabled' : 'disabled';
                showToast(`${label} ${status}.`);
            });
        });
    }

    /* =====================================================
       14. HASH ROUTING (deep-link support)
    ===================================================== */
    function initRouting() {
        // Set initial section from hash or saved
        const hashSection = window.location.hash.replace('#', '');
        const savedSection = localStorage.getItem('re_admin_section');
        const initial = SECTION_META[hashSection] ? hashSection
                       : SECTION_META[savedSection] ? savedSection
                       : 'overview';

        // Slight delay to allow DOM ready
        setTimeout(() => switchSection(initial), 40);

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const id = window.location.hash.replace('#', '');
            if (SECTION_META[id]) switchSection(id);
        });
    }

    /* =====================================================
       15. GLOBAL CLICK DELEGATION for data-section
    ===================================================== */
    function initDataSectionClicks() {
        document.addEventListener('click', (e) => {
            const el = e.target.closest('[data-section]');
            if (!el) return;

            // Skip nav links (handled separately) — actually allow them too
            const sectionId = el.dataset.section;
            if (sectionId && SECTION_META[sectionId]) {
                e.preventDefault();
                switchSection(sectionId);
            }
        });
    }

    /* =====================================================
       16. NAV LINK BINDING
    ===================================================== */
    function initNavLinks() {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.dataset.section;
                if (id) switchSection(id);
            });
        });

        // Mobile menu toggle
        DOM.mobileMenu?.addEventListener('click', toggleSidebar);
        DOM.sidebarOverlay?.addEventListener('click', closeSidebar);

        // Close sidebar on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && STATE.sidebarOpen) closeSidebar();
        });
    }

    /* =====================================================
       17. KEYBOARD SHORTCUTS
    ===================================================== */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K → focus search (if added later)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                showToast('Global search — coming soon.');
            }
            // Ctrl/Cmd + B → toggle sidebar (desktop convenience)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
        });
    }

    /* =====================================================
       18. TABLE ROW HOVER ENHANCEMENT
    ===================================================== */
    function initTableHover() {
        // Row click highlight (optional)
        $$('tbody tr').forEach(row => {
            row.addEventListener('click', (e) => {
                // Ignore clicks on buttons/links
                if (e.target.closest('button, a')) return;
                $$('tbody tr').forEach(r => r.style.background = '');
                row.style.background = 'rgba(212, 175, 55, 0.06)';
            });
        });
    }

    /* =====================================================
       19. INIT
    ===================================================== */
    function init() {
        console.log('%c👑 Royal Edge Admin Dashboard', 'color:#d4af37;font-weight:bold;font-size:14px;');

        initNavLinks();
        initDataSectionClicks();
        initRouting();
        initTabs();
        initStarRating();
        initForms();
        initTableActions();
        initCopyButtons();
        initNotifications();
        initQuickActions();
        initSwitches();
        initKeyboardShortcuts();
        initTableHover();

        // Welcome toast
        setTimeout(() => {
            showToast('Welcome back, Admin 👑');
        }, 900);
    }

    // Boot when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();