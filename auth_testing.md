Auth-Gated App Testing Playbook (Emergent Google Auth)

Step 1: Create Test User & Session
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  accent_color: 'ocean_blue',
  theme_mode: 'light',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"

Step 2: Test Backend API
curl -X GET "https://your-app.com/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "https://your-app.com/api/categories" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X POST "https://your-app.com/api/transactions" -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_SESSION_TOKEN" -d '{"type":"expense","amount":50000,"category_id":"CATEGORY_ID","date":"2026-07-01","description":"Test","payment_method":"cash"}'

Step 3: Browser Testing
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto("https://your-app.com/dashboard");

Checklist
- User document has user_id field (custom UUID, MongoDB's _id is separate)
- Session user_id matches user's user_id exactly
- All queries use {"_id": 0} projection to exclude MongoDB's _id
- Backend queries use user_id (not _id or id)
- API returns user data with user_id field (not 401/404)
- Browser loads dashboard (not login page)
- Callback detection uses useLocation().hash, not window.location.hash
