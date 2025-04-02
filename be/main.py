from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse

from services.routes import router as services_router
from verification.routes import router as verification_router
from users.routes import router as users_router

description = """
# SoundSleuth API

## Authentication
- Click the "Auto Login" button at the top of the page to instantly authenticate
- Standard login: Use `/verification/login` or `/verification/loginTest`

## Available Services
- Music recognition
- User management
"""

app = FastAPI(
    title="SoundSleuth API",
    description=description,
    version="1.0.0",
    docs_url=None  # We'll create a custom docs route
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(services_router, prefix="/services")
app.include_router(verification_router, prefix="/verification", tags=["authentication"])
app.include_router(users_router, prefix="/users", tags=["users"])

# Custom Swagger UI with auto-login button
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css">
        <title>SoundSleuth API - Docs</title>
        <style>
            #auto-login {
                background-color: #49cc90;
                color: white;
                border: none;
                padding: 6px 15px;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                margin: 10px;
                display: flex;
                align-items: center;
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
            }
            #auto-login:hover {
                background-color: #3db67e;
            }
            #login-status {
                margin-left: 10px;
                font-size: 14px;
            }
            .lock-icon {
                margin-right: 6px;
                font-size: 14px;
            }
            .spinner {
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top: 2px solid white;
                width: 12px;
                height: 12px;
                margin-right: 8px;
                animation: spin 1s linear infinite;
                display: none;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <!-- Add the button directly to the body, outside of Swagger UI -->
        <button id="auto-login">
            <div id="login-spinner" class="spinner"></div>
            <span class="lock-icon">🔑</span>
            <span id="login-status">Auto Login</span>
        </button>
        
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        
        <script>
            window.onload = function() {
                // Initialize the Swagger UI
                const ui = SwaggerUIBundle({
                    url: "/openapi.json",
                    dom_id: "#swagger-ui",
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIBundle.SwaggerUIStandalonePreset
                    ],
                    layout: "BaseLayout",
                    deepLinking: true,
                    persistAuthorization: true
                });
                
                // Function to automatically login
                async function performAutoLogin() {
                    const spinner = document.getElementById('login-spinner');
                    const statusText = document.getElementById('login-status');
                    
                    try {
                        spinner.style.display = 'block';
                        statusText.textContent = 'Logging in...';
                        
                        // Fetch the token
                        const response = await fetch('/verification/quick-token');
                        
                        if (!response.ok) {
                            throw new Error('Failed to get token');
                        }
                        
                        const data = await response.json();
                        const token = data.access_token;
                        
                        if (!token) {
                            throw new Error('Invalid token response');
                        }
                        
                        // Apply the token to Swagger UI
                        ui.authActions.authorize({
                            Bearer: {
                                name: "Bearer",
                                schema: {
                                    type: "apiKey",
                                    in: "header",
                                    name: "Authorization"
                                },
                                value: `Bearer ${token}`
                            }
                        });
                        
                        statusText.textContent = 'Authenticated ✓';
                        setTimeout(() => {
                            statusText.textContent = 'Auto Login';
                        }, 2000);
                    } catch (error) {
                        console.error('Auto-login error:', error);
                        statusText.textContent = 'Login Failed ✗';
                        setTimeout(() => {
                            statusText.textContent = 'Auto Login';
                        }, 2000);
                    } finally {
                        spinner.style.display = 'none';
                    }
                }
                
                // Add click event to the button
                document.getElementById('auto-login').addEventListener('click', performAutoLogin);
            }
        </script>
    </body>
    </html>
    """)

# Import auth module to make it available
import auth.jwt

