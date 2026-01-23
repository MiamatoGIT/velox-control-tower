export const loginCss = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;800&display=swap');
    :root { --bg: #020617; --card: #1e293b; --accent: #38bdf8; --red: #ef4444; }
    body { 
        background-color: var(--bg); color: #fff; font-family: 'Inter', sans-serif;
        height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0;
        background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 40px 40px;
    }
    .login-box {
        background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.1);
        padding: 40px; width: 350px; border-radius: 12px;
        box-shadow: 0 0 50px rgba(56, 189, 248, 0.1);
        backdrop-filter: blur(10px); text-align: center;
        border-top: 3px solid var(--accent);
    }
    h1 { font-family: 'JetBrains Mono'; letter-spacing: -1px; margin-bottom: 5px; font-size: 24px; }
    .subtitle { color: #64748b; font-size: 11px; font-family: 'JetBrains Mono'; margin-bottom: 30px; letter-spacing: 1px; }
    
    input {
        width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff;
        padding: 12px; margin-bottom: 15px; border-radius: 6px; font-family: 'JetBrains Mono'; outline: none;
    }
    input:focus { border-color: var(--accent); }
    
    button {
        width: 100%; background: var(--accent); color: #0f172a; font-weight: 800;
        padding: 12px; border: none; border-radius: 6px; cursor: pointer;
        font-family: 'JetBrains Mono'; transition: all 0.2s;
    }
    button:hover { box-shadow: 0 0 20px rgba(56, 189, 248, 0.4); transform: translateY(-1px); }
    
    .error { color: var(--red); font-size: 12px; margin-top: 15px; display: none; }
</style>
`;

export const renderLogin = () => `
<!DOCTYPE html>
<html>
<head><title>Stargate Access</title>${loginCss}</head>
<body>
    <div class="login-box">
        <h1>VELOX STARGATE</h1>
        <div class="subtitle">RESTRICTED AREA | AUTH REQUIRED</div>
        
        <form id="loginForm">
            <input type="text" id="username" placeholder="OPERATOR ID" required autocomplete="off" />
            <input type="password" id="password" placeholder="ACCESS KEY" required />
            <button type="submit">INITIALIZE SESSION</button>
            <div id="errorMsg" class="error">ACCESS DENIED: INVALID CREDENTIALS</div>
        </form>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const err = document.getElementById('errorMsg');
            
            try {
                const res = await fetch('/auth/web-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p })
                });
                
                if (res.ok) {
                    window.location.href = '/mission-control'; // Redirect on success
                } else {
                    err.style.display = 'block';
                    document.querySelector('.login-box').style.borderColor = '#ef4444';
                }
            } catch (e) { console.error(e); }
        });
    </script>
</body>
</html>
`;