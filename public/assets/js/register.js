document.addEventListener('DOMContentLoaded', function () {
    const password = document.querySelector('input[name="password"]');
    const confirmPassword = document.querySelector('input[name="confirmPassword"]');
    const form = document.querySelector('form');

    function validatePassword() {
        const passwordValue = password.value;
        const confirmPasswordValue = confirmPassword.value;

        if (passwordValue !== confirmPasswordValue && confirmPasswordValue !== '') {
            confirmPassword.setCustomValidity('Les mots de passe ne correspondent pas');
            confirmPassword.classList.add('input-error');
        } else {
            confirmPassword.setCustomValidity('');
            confirmPassword.classList.remove('input-error');
        }
    }

    password.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validatePassword);

    form.addEventListener('submit', function (e) {
        validatePassword();

        if (!form.checkValidity()) {
            e.preventDefault();

            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.focus();

                if (firstInvalid.name === 'password') {
                    alert('Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)');
                } else if (firstInvalid.name === 'confirmPassword') {
                    alert('Les mots de passe ne correspondent pas');
                }
            }
        }
    });
});
