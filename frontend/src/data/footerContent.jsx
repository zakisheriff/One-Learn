import React from 'react';

export const footerContent = {
    about: {
        title: "About You Learn",
        content: (
            <>
                <section className="info-section">
                    <h2>Our Mission</h2>
                    <p>At You Learn, we believe that education is the key to unlocking human potential. Our mission is to provide accessible, high-quality learning experiences to everyone, everywhere. We connect expert instructors with eager learners to create a global community of knowledge sharing.</p>
                </section>
                <section className="info-section">
                    <h2>Who We Are</h2>
                    <p>Founded in 2024, You Learn has grown from a small startup to a leading online learning platform. We are a team of educators, engineers, and designers passionate about the future of education.</p>
                </section>
                <section className="info-section">
                    <h2>Our Values</h2>
                    <ul className="info-list">
                        <li><strong>Accessibility:</strong> Learning should have no boundaries.</li>
                        <li><strong>Quality:</strong> We strive for excellence in every course.</li>
                        <li><strong>Community:</strong> We learn better together.</li>
                        <li><strong>Innovation:</strong> We embrace new technologies to enhance learning.</li>
                    </ul>
                </section>
            </>
        )
    },
    careers: {
        title: "Join Our Team",
        content: (
            <>
                <section className="info-section">
                    <p className="lead-text">Build the future of education with us.</p>
                    <p>We're looking for passionate individuals who want to make a difference. If you're driven by curiosity and a desire to help others learn, you'll fit right in.</p>
                </section>
                <section className="info-section">
                    <h2>Open Positions</h2>
                    <div className="job-list">
                        <div className="job-item">
                            <h3>Senior Full Stack Engineer</h3>
                            <p>Remote • Engineering</p>
                        </div>
                        <div className="job-item">
                            <h3>Product Designer</h3>
                            <p>San Francisco, CA • Design</p>
                        </div>
                        <div className="job-item">
                            <h3>Curriculum Developer</h3>
                            <p>New York, NY • Content</p>
                        </div>
                    </div>
                    <p className="apply-note">To apply, please send your resume and portfolio to <a href="mailto:careers@youlearn.com">careers@youlearn.com</a>.</p>
                </section>
            </>
        )
    },
    press: {
        title: "Press & Media",
        content: (
            <>
                <section className="info-section">
                    <p>For press inquiries, please contact <a href="mailto:press@youlearn.com">press@youlearn.com</a>.</p>
                </section>
                <section className="info-section">
                    <h2>Latest News</h2>
                    <div className="press-release">
                        <span className="date">November 15, 2024</span>
                        <h3>You Learn Reaches 1 Million Learners Worldwide</h3>
                        <p>We are thrilled to announce a major milestone in our journey to democratize education.</p>
                    </div>
                    <div className="press-release">
                        <span className="date">October 1, 2024</span>
                        <h3>Launching "You Learn for Business"</h3>
                        <p>Empowering organizations to upskill their workforce with enterprise-grade learning solutions.</p>
                    </div>
                </section>
            </>
        )
    },
    blog: {
        title: "You Learn Blog",
        content: (
            <>
                <section className="info-section">
                    <p>Insights, tips, and stories from the world of online learning.</p>
                </section>
                <div className="blog-grid">
                    <div className="blog-post">
                        <h3>Top 10 Skills to Learn in 2025</h3>
                        <p>Discover the most in-demand skills that employers are looking for this year.</p>
                        <a href="#">Read More &rarr;</a>
                    </div>
                    <div className="blog-post">
                        <h3>How to Stay Motivated While Learning Online</h3>
                        <p>Practical tips to keep your momentum going when studying from home.</p>
                        <a href="#">Read More &rarr;</a>
                    </div>
                    <div className="blog-post">
                        <h3>The Future of AI in Education</h3>
                        <p>Exploring how artificial intelligence is personalizing the learning experience.</p>
                        <a href="#">Read More &rarr;</a>
                    </div>
                </div>
            </>
        )
    },
    contact: {
        title: "Contact Us",
        content: (
            <>
                <section className="info-section">
                    <p>Have a question or need support? We're here to help.</p>
                </section>
                <div className="contact-grid">
                    <div className="contact-info">
                        <h3>Get in Touch</h3>
                        <p><strong>Email:</strong> support@youlearn.com</p>
                        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                        <p><strong>Address:</strong><br />123 Learning Way<br />San Francisco, CA 94105</p>
                    </div>
                    <div className="contact-form-wrapper">
                        <h3>Send us a message</h3>
                        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" placeholder="Your Name" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="your@email.com" />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows="4" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="submit" className="btn-primary">Send Message</button>
                        </form>
                    </div>
                </div>
            </>
        )
    },
    community: {
        title: "Community",
        content: (
            <>
                <section className="info-section">
                    <p>Join thousands of learners from around the world. Share knowledge, ask questions, and grow together.</p>
                </section>
                <div className="community-links">
                    <div className="community-card">
                        <h3>Discussion Forums</h3>
                        <p>Dive into topic-specific discussions and get answers from experts.</p>
                        <button className="btn-outline">Visit Forums</button>
                    </div>
                    <div className="community-card">
                        <h3>Student Showcase</h3>
                        <p>See what other learners are building and share your own projects.</p>
                        <button className="btn-outline">View Showcase</button>
                    </div>
                    <div className="community-card">
                        <h3>Local Meetups</h3>
                        <p>Connect with learners in your area for study groups and networking.</p>
                        <button className="btn-outline">Find Meetups</button>
                    </div>
                </div>
            </>
        )
    },
    accessibility: {
        title: "Accessibility Statement",
        content: (
            <>
                <section className="info-section">
                    <p>You Learn is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
                </section>
                <section className="info-section">
                    <h2>Conformance Status</h2>
                    <p>The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. You Learn is partially conformant with WCAG 2.1 level AA.</p>
                </section>
                <section className="info-section">
                    <h2>Feedback</h2>
                    <p>We welcome your feedback on the accessibility of You Learn. Please let us know if you encounter accessibility barriers on You Learn:</p>
                    <p>E-mail: <a href="mailto:accessibility@youlearn.com">accessibility@youlearn.com</a></p>
                </section>
            </>
        )
    },
    privacy: {
        title: "Privacy Policy",
        content: (
            <>
                <section className="info-section">
                    <p>Last updated: November 29, 2024</p>
                    <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
                </section>
                <section className="info-section">
                    <h2>Collecting and Using Your Personal Data</h2>
                    <h3>Types of Data Collected</h3>
                    <h4>Personal Data</h4>
                    <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
                    <ul className="info-list">
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Phone number</li>
                        <li>Usage Data</li>
                    </ul>
                </section>
                <section className="info-section">
                    <h2>Security of Your Personal Data</h2>
                    <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
                </section>
            </>
        )
    },
    terms: {
        title: "Terms of Service",
        content: (
            <>
                <section className="info-section">
                    <p>Please read these terms and conditions carefully before using Our Service.</p>
                </section>
                <section className="info-section">
                    <h2>Interpretation and Definitions</h2>
                    <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                </section>
                <section className="info-section">
                    <h2>Acknowledgment</h2>
                    <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
                    <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
                </section>
            </>
        )
    },
    cookies: {
        title: "Cookie Policy",
        content: (
            <>
                <section className="info-section">
                    <p>This Cookie Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of cookies We use, or the information We collect using Cookies and how that information is used.</p>
                </section>
                <section className="info-section">
                    <h2>Type of Cookies We Use</h2>
                    <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close your web browser.</p>
                    <ul className="info-list">
                        <li><strong>Necessary / Essential Cookies:</strong> These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features.</li>
                        <li><strong>Functionality Cookies:</strong> These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference.</li>
                    </ul>
                </section>
            </>
        )
    },
    security: {
        title: "Security",
        content: (
            <>
                <section className="info-section">
                    <p>At You Learn, we take security seriously. We employ industry-standard security measures to ensure the safety of your data and our platform.</p>
                </section>
                <section className="info-section">
                    <h2>Our Security Measures</h2>
                    <ul className="info-list">
                        <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher.</li>
                        <li><strong>Data Protection:</strong> We use advanced firewalls and intrusion detection systems to protect against unauthorized access.</li>
                        <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments to identify and address potential risks.</li>
                    </ul>
                </section>
                <section className="info-section">
                    <h2>Reporting Vulnerabilities</h2>
                    <p>If you believe you have found a security vulnerability in our platform, please report it to our security team at <a href="mailto:security@youlearn.com">security@youlearn.com</a>.</p>
                </section>
            </>
        )
    }
};
