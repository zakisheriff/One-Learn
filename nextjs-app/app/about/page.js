export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '24px' }}>About One Learn</h1>
            <div style={{ fontSize: '18px', lineHeight: '1.8', color: '#ccc' }}>
                <p style={{ marginBottom: '20px' }}>
                    One Learn is a platform dedicated to making quality education accessible to everyone.
                    We curate the best free YouTube courses and provide structured learning paths, quizzes,
                    and verified certificates.
                </p>
                <p style={{ marginBottom: '20px' }}>
                    Our mission is to transform YouTube viewing time into valuable credentials that can
                    advance your career and skills.
                </p>
                <h2 style={{ fontSize: '32px', marginTop: '40px', marginBottom: '16px', color: 'white' }}>Our Values</h2>
                <ul style={{ listStyle: 'disc', paddingLeft: '24px' }}>
                    <li style={{ marginBottom: '12px' }}>Free, quality education for all</li>
                    <li style={{ marginBottom: '12px' }}>Verified learning outcomes</li>
                    <li style={{ marginBottom: '12px' }}>Community-driven content</li>
                    <li style={{ marginBottom: '12px' }}>Transparent and accessible</li>
                </ul>
            </div>
        </div>
    );
}
