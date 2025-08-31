export default function LoginPage() {
    return (
        <form method="POST" action="/api/auth/login">
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" type="email" required />
            <label htmlFor="password">Password:</label>
            <input id="password" name="password" type="password" required />
            <button type="submit">Log in</button>
        </form>
    )
}