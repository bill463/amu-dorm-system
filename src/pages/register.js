
import { apiCall } from '../utils/api.js';
import { showToast } from '../components/Toast.js';

export const render = `
<div style="display: flex; min-height: 100vh;">
    <!-- Left Side - Image/Brand -->
    <div style="
        flex: 1; 
        background-image: linear-gradient(rgba(13, 148, 136, 0.8), rgba(13, 148, 136, 0.6)), url('/dorm-bg.jpg'); 
        background-size: cover; 
        background-position: center; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        padding: 4rem; 
        color: white;
        display: none;
    " class="desktop-only">
        <h1 style="color: white; font-size: 3.5rem; margin-bottom: 1rem;">Join the Community</h1>
        <p style="font-size: 1.5rem; opacity: 0.9;">Self-Registration for Student Dormitory System.</p>
    </div>

    <!-- Right Side - Form -->
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: var(--background-color); padding: 2rem;">
        <div class="card" style="width: 100%; max-width: 480px; padding: 2.5rem; border: none; box-shadow: none; background: transparent;">
            
            <div style="text-align: center; margin-bottom: 2rem;">
                <img src="/amu-logo.png" alt="AMU Logo" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 1rem;">
                <h1 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 2rem;">Create Account</h1>
                <p style="color: var(--text-secondary);">Step <span id="step-indicator">1</span> of 2</p>
            </div>
            
            <!-- Step 1: Initial Details -->
            <form id="register-step-1">
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Student ID</label>
                    <input type="text" id="reg-id" required placeholder="e.g. NSR/1234/15" 
                        style="background: white; border-color: #e2e8f0; width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Full Name</label>
                    <input type="text" id="reg-name" required placeholder="e.g. Abebe Kebede" 
                        style="background: white; border-color: #e2e8f0; width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Department</label>
                     <select id="reg-dept" class="form-input" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; background: white;">
                        <option value="">Select Department</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Surveying Engineering">Surveying Engineering</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electrical & Computer Engineering">Electrical & Computer Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                </div>

                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">AMU Email</label>
                    <input type="email" id="reg-email" required placeholder="student_id@amu.edu.et" 
                        style="background: white; border-color: #e2e8f0; width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">Must be a valid @amu.edu.et address.</p>
                </div>

                <button type="submit" id="btn-step-1" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">Continue</button>
            </form>

            <!-- Step 2: Verification & Password -->
            <form id="register-step-2" style="display: none;">
                <div style="background: #f0fdf4; color: #15803d; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; font-size: 0.9rem;">
                    We've sent a verification code to your email. Please enter it below.
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Verification Code</label>
                    <input type="text" id="reg-code" required placeholder="6-digit code" maxlength="6"
                        style="background: white; border-color: #e2e8f0; width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; letter-spacing: 0.25rem; text-align: center; font-size: 1.2rem;">
                </div>

                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Set Password</label>
                    <input type="password" id="reg-password" required placeholder="Create a strong password" 
                        style="background: white; border-color: #e2e8f0; width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <button type="submit" id="btn-step-2" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">Complete Registration</button>
                <div style="text-align: center; margin-top: 1rem;">
                    <button type="button" id="back-to-step-1" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; text-decoration: underline;">Back</button>
                </div>
            </form>
            
            <div style="text-align: center; margin-top: 2rem;">
                <p style="color: var(--text-secondary); font-size: 0.95rem;">
                    Already have an account? <a href="#/login" style="color: var(--primary-color);">Sign In</a>
                </p>
            </div>
        </div>
    </div>
</div>
<style>
    @media (min-width: 768px) {
        .desktop-only { display: flex !important; }
    }
</style>
`;

export const init = () => {
  const form1 = document.getElementById('register-step-1');
  const form2 = document.getElementById('register-step-2');
  const btnBack = document.getElementById('back-to-step-1');
  const stepIndicator = document.getElementById('step-indicator');

  // State
  let pendingEmail = '';

  if (form1) {
    form1.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-step-1');
      const originalText = btn.innerText;

      const id = document.getElementById('reg-id').value.trim();
      const name = document.getElementById('reg-name').value.trim();
      const dept = document.getElementById('reg-dept').value;
      const email = document.getElementById('reg-email').value.trim();

      // Client-side Domain Check
      if (!email.endsWith('@amu.edu.et')) {
        showToast('Please use a valid AMU email address ending in @amu.edu.et', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerText = 'Verifying Domain...';

      try {
        const result = await apiCall('/auth/register-init', 'POST', { id, name, department: dept, email });

        if (result.success) {
          // Move to step 2
          pendingEmail = email;
          form1.style.display = 'none';
          form2.style.display = 'block';
          stepIndicator.innerText = '2';
          showToast(result.message || 'Verification code sent!', 'success');
        } else {
          showToast(result.message || 'Registration failed', 'error');
        }
      } catch (error) {
        showToast('Error: ' + error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerText = originalText;
      }
    });
  }

  if (form2) {
    form2.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-step-2');
      const originalText = btn.innerText;

      const code = document.getElementById('reg-code').value.trim();
      const password = document.getElementById('reg-password').value;

      btn.disabled = true;
      btn.innerText = 'Creating Account...';

      try {
        const result = await apiCall('/auth/register-verify', 'POST', {
          email: pendingEmail,
          code,
          password
        });

        if (result.success) {
          showToast('Registration Successful! Please log in.', 'success');
          setTimeout(() => {
            window.location.hash = '#/login';
          }, 1500);
        } else {
          showToast(result.message || 'Verification failed', 'error');
        }
      } catch (error) {
        showToast('Error: ' + error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerText = originalText;
      }
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      form2.style.display = 'none';
      form1.style.display = 'block';
      stepIndicator.innerText = '1';
    });
  }
};
