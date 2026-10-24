import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Infosys",
    category: "Development",
    location: "Hyderabad",
    type: "Full Time",
    salary: "3–5 LPA",
    description:
      "Build user-friendly websites using HTML, CSS, JavaScript and React.",
    skills: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    id: 2,
    title: "Python Developer",
    company: "TCS",
    category: "Development",
    location: "Bengaluru",
    type: "Full Time",
    salary: "3–4.5 LPA",
    description:
      "Develop Python applications, write clean code and solve programming problems.",
    skills: ["Python", "OOP", "SQL", "Problem Solving"],
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "Accenture",
    category: "Analytics",
    location: "Hyderabad",
    type: "Full Time",
    salary: "3.5–5 LPA",
    description:
      "Analyze datasets, prepare reports and help teams make data-driven decisions.",
    skills: ["SQL", "Excel", "Python", "Data Analysis"],
  },
  {
    id: 4,
    title: "Java Developer",
    company: "Wipro",
    category: "Development",
    location: "Chennai",
    type: "Full Time",
    salary: "3–4 LPA",
    description:
      "Develop and maintain Java applications using object-oriented programming.",
    skills: ["Java", "OOP", "SQL", "Problem Solving"],
  },
  {
    id: 5,
    title: "Software Engineer",
    company: "Cognizant",
    category: "Engineering",
    location: "Bengaluru",
    type: "Full Time",
    salary: "3.5–5 LPA",
    description:
      "Work with a development team to build, test and maintain software applications.",
    skills: ["Programming", "SQL", "Git", "Testing"],
  },
  {
    id: 6,
    title: "Web Development Intern",
    company: "IBM",
    category: "Internship",
    location: "Remote",
    type: "Internship",
    salary: "As per company policy",
    description:
      "Learn web development and contribute to real-world website development tasks.",
    skills: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    id: 7,
    title: "Junior Software Developer",
    company: "Deloitte",
    category: "Development",
    location: "Hyderabad",
    type: "Full Time",
    salary: "4–6 LPA",
    description:
      "Assist in application development, debugging, testing and documentation.",
    skills: ["Python", "Java", "SQL", "Communication"],
  },
  {
    id: 8,
    title: "SQL Developer Intern",
    company: "Infosys",
    category: "Internship",
    location: "Remote",
    type: "Internship",
    salary: "As per company policy",
    description:
      "Practice database queries, write SQL statements and assist with database tasks.",
    skills: ["SQL", "Database", "Joins", "Queries"],
  },
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  college: "",
  qualification: "",
  branch: "",
  graduationYear: "",
  skills: "",
  experience: "",
  interest: "",
};

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [resume, setResume] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      setUser(null);
    }

    loadApplications();
  }, []);

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("userToken") ||
    "";

  const loadApplications = async () => {
    const token = getToken();

    if (!token) {
      setApplications([]);
      return;
    }

    try {
      const response = await axios.get(`${API}/applications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setApplications(data);
      } else if (Array.isArray(data.applications)) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error(
        "Could not load applications:",
        err.response?.data || err.message
      );
    }
  };

  const openJob = (job) => {
    setSelectedJob(job);
    setShowForm(false);
    setForm({
      ...initialForm,
      email: user?.email || "",
      fullName: user?.name || user?.fullName || "",
    });
    setResume(null);
    setError("");
    setSuccess("");

    setTimeout(() => {
      document
        .getElementById("job-details")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = getToken();

    if (!token) {
      setError("Please login first to apply for a job.");
      return;
    }

    if (!selectedJob) {
      setError("Please select a job first.");
      return;
    }

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill in your name, email and phone number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("jobId", String(selectedJob.id));
      formData.append("title", selectedJob.title);
      formData.append("company", selectedJob.company);
      formData.append("category", selectedJob.category);
      formData.append("location", selectedJob.location);
      formData.append("type", selectedJob.type);
      formData.append("salary", selectedJob.salary);

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (resume) formData.append("resume", resume);

      const response = await axios.post(`${API}/applications`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(
        response.data?.message || "Application submitted successfully!"
      );

      await loadApplications();
      setForm(initialForm);
      setResume(null);
      setShowForm(false);
    } catch (err) {
      console.error(
        "Application submission failed:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Application failed. Please check the backend route and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      job.company.toLowerCase().includes(searchText) ||
      job.category.toLowerCase().includes(searchText) ||
      job.location.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All" ||
      job.category === filter ||
      job.type === filter;

    return matchesSearch && matchesFilter;
  });

  const applicationCount = applications.length;

  const pendingCount = applications.filter(
    (application) =>
      !application.status || application.status === "Under Review"
  ).length;

  const acceptedCount = applications.filter(
    (application) => application.status === "Accepted"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  return (
    <main className="dashboard-page">
      {/* DASHBOARD WELCOME */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-label">CAREERCONNECT</span>

          <h1>
            Welcome
            {user?.name || user?.fullName
              ? `, ${user.name || user.fullName}`
              : ""}
            !
          </h1>

          <p>
            Discover career opportunities, explore job roles, and track your
            applications in one place.
          </p>

          <a className="dashboard-hero-button" href="#available-jobs">
            Explore Jobs
          </a>
        </div>
      </section>

      
      <section className="dashboard-stats">
        <article className="stat-card">
          <span className="stat-icon">💼</span>
          <div>
            <p>Available Jobs</p>
            <h2>{jobs.length}</h2>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon">📄</span>
          <div>
            <p>My Applications</p>
            <h2>{applicationCount}</h2>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon">⏳</span>
          <div>
            <p>Under Review</p>
            <h2>{pendingCount}</h2>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <p>Accepted</p>
            <h2>{acceptedCount}</h2>
          </div>
        </article>
      </section>

      
      <section className="dashboard-about" id="about-careerconnect">
        <div className="about-intro">
          <span className="section-eyebrow">ABOUT CAREERCONNECT</span>

          <h2>Your Career Journey Starts Here!</h2>

          <p>
            CareerConnect is a job and internship portal designed to help
            students, fresh graduates, and job seekers explore career
            opportunities in one place.
          </p>

          <p>
            The platform helps users understand job requirements, identify
            relevant technical skills, submit applications, upload resumes,
            and track application status through a simple dashboard.
          </p>

          <p>
            Whether you are looking for your first job or an internship,
            CareerConnect helps you organize your job search and take the
            next step in your career.
          </p>

          <a href="#available-jobs" className="primary-button">
            Explore Opportunities →
          </a>
        </div>

        <div className="about-features">
          <article>
            <span>🔎</span>
            <div>
              <h3>Job Search</h3>
              <p>
                Search opportunities by job title, company, category, and
                location.
              </p>
            </div>
          </article>

          <article>
            <span>📖</span>
            <div>
              <h3>Job Information</h3>
              <p>
                Review job descriptions, required skills, employment types,
                locations, and displayed salary information.
              </p>
            </div>
          </article>

          <article>
            <span>📝</span>
            <div>
              <h3>Easy Application</h3>
              <p>
                Enter your personal and educational details, mention your
                skills, and upload your resume.
              </p>
            </div>
          </article>

          <article>
            <span>📊</span>
            <div>
              <h3>Application Tracking</h3>
              <p>
                View your submitted applications and check their current
                status in My Applications.
              </p>
            </div>
          </article>

          <article>
            <span>🎯</span>
            <div>
              <h3>Career Preparation</h3>
              <p>
                Use job descriptions to identify skills you need to improve
                and prepare for technical interviews.
              </p>
            </div>
          </article>

          <article>
            <span>🔐</span>
            <div>
              <h3>User Account</h3>
              <p>
                Log in to access your dashboard and use the available
                application features.
              </p>
            </div>
          </article>
        </div>
      </section>

      
      <section className="career-process-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">HOW IT WORKS</span>
            <h2>How CareerConnect Works</h2>
            <p>Follow these four simple steps to apply for an opportunity.</p>
          </div>
        </div>

        <div className="career-process-grid">
          <article className="process-card">
            <span className="process-number">01</span>
            <h3>Explore Jobs</h3>
            <p>Browse available job and internship listings.</p>
          </article>

          <article className="process-card">
            <span className="process-number">02</span>
            <h3>Check Details</h3>
            <p>Review the job description and skills required for the role.</p>
          </article>

          <article className="process-card">
            <span className="process-number">03</span>
            <h3>Submit Application</h3>
            <p>Complete the application form and provide your details.</p>
          </article>

          <article className="process-card">
            <span className="process-number">04</span>
            <h3>Track Status</h3>
            <p>Visit My Applications to check the status recorded by the portal.</p>
          </article>
        </div>
      </section>

      
      <section className="career-benefits-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">OUR BENEFITS</span>
            <h2>Why Use CareerConnect?</h2>
            <p>Features designed to make your job search more organized.</p>
          </div>
        </div>

        <div className="career-benefits-grid">
          <article className="benefit-card">
            <span>⚡</span>
            <h3>Simple Interface</h3>
            <p>
              Find and explore opportunities through an easy-to-use dashboard.
            </p>
          </article>

          <article className="benefit-card">
            <span>📚</span>
            <h3>Skill Awareness</h3>
            <p>
              Learn about technical skills associated with different roles.
            </p>
          </article>

          <article className="benefit-card">
            <span>🗂️</span>
            <h3>Application Records</h3>
            <p>View your submitted applications together in one section.</p>
          </article>

          <article className="benefit-card">
            <span>🚀</span>
            <h3>Career Growth</h3>
            <p>
              Use job requirements to guide your learning and interview
              preparation.
            </p>
          </article>
        </div>
      </section>

      {/* APPLICATION GUIDELINES */}
      <section className="career-guidelines-section">
        <span className="section-eyebrow">APPLICATION TIPS</span>
        <h2>Before You Apply</h2>

        <ul>
          <li>Enter your correct name, email address, and phone number.</li>
          <li>Provide accurate college, qualification, branch, and graduation details.</li>
          <li>Mention your technical skills honestly.</li>
          <li>Upload an updated resume in an accepted file format.</li>
          <li>Read the job description carefully before applying.</li>
          <li>Check My Applications for the latest status available.</li>
        </ul>
      </section>

      
      <section className="jobs-section" id="available-jobs">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">FIND YOUR NEXT OPPORTUNITY</span>
            <h2>Available Jobs & Internships</h2>
            <p>Choose a role that matches your interests and skills.</p>
          </div>
        </div>

        <div className="job-search-bar">
          <input
            type="text"
            placeholder="Search job, company, or location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All Opportunities</option>
            <option value="Development">Development</option>
            <option value="Analytics">Analytics</option>
            <option value="Engineering">Engineering</option>
            <option value="Internship">Internships</option>
          </select>
        </div>

        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card-top">
                <span className="job-company-icon">
                  {job.company.charAt(0)}
                </span>
                <span className="job-type">{job.type}</span>
              </div>

              <h3>{job.title}</h3>
              <p className="job-company">{job.company}</p>

              <div className="job-meta">
                <span>📍 {job.location}</span>
                <span>💰 {job.salary}</span>
              </div>

              <p className="job-description">{job.description}</p>

              <div className="job-skills">
                {job.skills.slice(0, 3).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => openJob(job)}
              >
                Apply Now →
              </button>
            </article>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <p className="empty-message">
            No opportunities found. Try a different search.
          </p>
        )}
      </section>

      
      {selectedJob && (
        <section className="selected-job-section" id="job-details">
          <div className="selected-job-card">
            <div className="selected-job-heading">
              <div>
                <span className="section-eyebrow">JOB DETAILS</span>
                <h2>{selectedJob.title}</h2>
                <p>
                  {selectedJob.company} · {selectedJob.location}
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() => {
                  setSelectedJob(null);
                  setShowForm(false);
                  setError("");
                  setSuccess("");
                }}
              >
                ✕ Close
              </button>
            </div>

            <div className="selected-job-info">
              <div>
                <span>Employment Type</span>
                <strong>{selectedJob.type}</strong>
              </div>

              <div>
                <span>Salary / Stipend</span>
                <strong>{selectedJob.salary}</strong>
              </div>

              <div>
                <span>Job Category</span>
                <strong>{selectedJob.category}</strong>
              </div>
            </div>

            <h3>About This Role</h3>
            <p>{selectedJob.description}</p>

            <h3>Skills Required</h3>
            <div className="job-skills detail-skills">
              {selectedJob.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            {!showForm && (
              <button
                type="button"
                className="primary-button continue-button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowForm(true);
                }}
              >
                Continue to Application Form →
              </button>
            )}

            {showForm && (
              <div className="application-form-container">
                <h2>Application Form</h2>
                <p className="form-intro">
                  Enter your details carefully before submitting your
                  application for {selectedJob.title}.
                </p>

                {error && (
                  <div className="message-box error-message">{error}</div>
                )}

                {success && (
                  <div className="message-box success-message">{success}</div>
                )}

                <form onSubmit={handleSubmit} className="application-form">
                  <div className="form-grid">
                    <label>
                      Full Name *
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </label>

                    <label>
                      Email Address *
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </label>

                    <label>
                      Phone Number *
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </label>

                    <label>
                      College Name
                      <input
                        type="text"
                        name="college"
                        value={form.college}
                        onChange={handleInputChange}
                        placeholder="Enter your college"
                      />
                    </label>

                    <label>
                      Qualification
                      <select
                        name="qualification"
                        value={form.qualification}
                        onChange={handleInputChange}
                      >
                        <option value="B.Tech">B.Tech</option>
                        <option value="B.E.">B.E.</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>

                    <label>
                      Branch
                      <input
                        type="text"
                        name="branch"
                        value={form.branch}
                        onChange={handleInputChange}
                        placeholder="e.g. CSE"
                      />
                    </label>

                    <label>
                      Graduation Year
                      <select
                        name="graduationYear"
                        value={form.graduationYear}
                        onChange={handleInputChange}
                      >
                        <option value="">Select year</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                        <option value="2030">2030</option>
                      </select>
                    </label>

                    <label>
                      Experience
                      <select
                        name="experience"
                        value={form.experience}
                        onChange={handleInputChange}
                      >
                        <option value="">Select experience</option>
                        <option value="Fresher">Fresher</option>
                        <option value="Internship Experience">
                          Internship Experience
                        </option>
                        <option value="1+ Years">1+ Years</option>
                      </select>
                    </label>

                    <label className="full-width-field">
                      Technical Skills
                      <textarea
                        name="skills"
                        value={form.skills}
                        onChange={handleInputChange}
                        placeholder="e.g. Python, SQL, HTML, CSS"
                        rows={3}
                      />
                    </label>

                    <label className="full-width-field">
                      Why are you interested in this role?
                      <textarea
                        name="interest"
                        value={form.interest}
                        onChange={handleInputChange}
                        placeholder="Explain briefly why you are interested"
                        rows={3}
                      />
                    </label>

                    <label className="full-width-field">
                      Upload Resume (PDF/DOC/DOCX)
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          if (file && file.size > 5 * 1024 * 1024) {
                            setError("Resume size must be 5 MB or less.");
                            event.target.value = "";
                            setResume(null);
                            return;
                          }

                          setError("");
                          setResume(file || null);
                        }}
                      />
                      <small>Maximum file size: 5 MB.</small>
                    </label>
                  </div>

                  {error && (
                    <div className="message-box error-message">{error}</div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setShowForm(false);
                        setError("");
                      }}
                    >
                      Back to Job Details
                    </button>

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      {/* MY APPLICATIONS */}
      <section className="applications-section" id="my-applications">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">YOUR ACTIVITY</span>
            <h2>My Applications</h2>
            <p>Check the latest status of your submitted applications.</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadApplications}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="application-status-summary">
          <div>
            <span>Total</span>
            <strong>{applicationCount}</strong>
          </div>

          <div>
            <span>Under Review</span>
            <strong>{pendingCount}</strong>
          </div>

          <div>
            <span>Accepted</span>
            <strong>{acceptedCount}</strong>
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="empty-applications">
            <span>📄</span>
            <h3>No applications yet</h3>
            <p>When you submit an application, it will appear here.</p>
            <a href="#available-jobs" className="primary-button">
              Browse Jobs
            </a>
          </div>
        ) : (
          <div className="applications-table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((application, index) => (
                  <tr key={application._id || application.id || index}>
                    <td>
                      {application.title ||
                        application.jobTitle ||
                        "Job Application"}
                    </td>
                    <td>{application.company || "—"}</td>
                    <td>
                      {application.createdAt
                        ? new Date(application.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${(
                          application.status || "Under Review"
                        )
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {application.status || "Under Review"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default UserDashboard;

