import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function HRDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Load all applications from backend
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/applications/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setApplications(
        Array.isArray(data) ? data : data.applications || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Applications load avvaledu. Backend and login check cheyyandi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update application status
  const updateStatus = async (applicationId, status) => {
    try {
      setMessage("");
      setError("");

      await axios.patch(
        `${API}/applications/${applicationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Application status updated successfully!");

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application._id === applicationId
            ? { ...application, status }
            : application
        )
      );

      if (selectedApplication?._id === applicationId) {
        setSelectedApplication((previous) => ({
          ...previous,
          status,
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Status update avvaledu. Backend route check cheyyandi."
      );
    }
  };

  // View or download a candidate's resume (HR only, requires auth token)
  const openResume = async (resumePath, mode) => {
    try {
      setError("");

      const response = await axios.get(
        `${API}/applications/resume/${encodeURIComponent(resumePath)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blobUrl = URL.createObjectURL(response.data);

      if (mode === "view") {
        window.open(blobUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } else {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = resumePath;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Resume fetch failed:", err);

      setError(
        err.response?.data?.message ||
          "Resume load avvaledu. Backend route check cheyyandi."
      );
    }
  };

  // Get student details from application or applicant
  const getApplicant = (application) => {
    const applicant =
      application.applicant &&
      typeof application.applicant === "object"
        ? application.applicant
        : {};

    const studentDetails =
      application.studentDetails &&
      typeof application.studentDetails === "object"
        ? application.studentDetails
        : {};

    // Backend stores student form fields flat on the application document
    const form = application || {};

    // Support different field names
    return {
      ...form,
      ...studentDetails,
      ...applicant,

      name:
        applicant.name ||
        applicant.fullName ||
        studentDetails.name ||
        studentDetails.fullName ||
        form.fullName ||
        "",

      email:
        applicant.email ||
        studentDetails.email ||
        form.email ||
        "",

      phone:
        applicant.phone ||
        applicant.mobile ||
        applicant.phoneNumber ||
        applicant.contactNumber ||
        studentDetails.phone ||
        studentDetails.mobile ||
        studentDetails.phoneNumber ||
        studentDetails.contactNumber ||
        form.phone ||
        "",

      college:
        applicant.college ||
        applicant.collegeName ||
        studentDetails.college ||
        studentDetails.collegeName ||
        form.college ||
        "",

      qualification:
        applicant.qualification ||
        applicant.education ||
        applicant.degree ||
        studentDetails.qualification ||
        studentDetails.education ||
        studentDetails.degree ||
        form.qualification ||
        "",

      branch:
        applicant.branch ||
        applicant.department ||
        studentDetails.branch ||
        studentDetails.department ||
        form.branch ||
        "",

      graduationYear:
        applicant.graduationYear ||
        applicant.year ||
        studentDetails.graduationYear ||
        studentDetails.year ||
        form.graduationYear ||
        "",

      skills:
        applicant.skills ||
        applicant.technicalSkills ||
        studentDetails.skills ||
        studentDetails.technicalSkills ||
        form.skills ||
        "",

      experience:
        applicant.experience ||
        studentDetails.experience ||
        form.experience ||
        "",

      location:
        form.location ||
        applicant.location ||
        studentDetails.location ||
        "",
    };
  };

  // Search and filter applications
  const filteredApplications = applications.filter((application) => {
    const applicant = getApplicant(application);

    const name = applicant.name || "";
    const email = applicant.email || "";
    const job = application.title || "";
    const company = application.company || "";

    const searchText =
      `${name} ${email} ${job} ${company}`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" ||
      application.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Dashboard statistics
  const totalApplications = applications.length;

  const underReview = applications.filter(
    (application) => application.status === "Under Review"
  ).length;

  const accepted = applications.filter(
    (application) => application.status === "Accepted"
  ).length;

  const rejected = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="hr-dashboard">
      {/* Sidebar */}
      <aside className="hr-sidebar">
        <div className="hr-logo">
          <div className="hr-logo-icon">CC</div>
          <h2>CareerConnect</h2>
        </div>

        <p className="hr-menu-heading">MAIN MENU</p>

        <a href="#overview" className="hr-menu-item active">
          <span>▦</span> Overview
        </a>

        <a href="#applications" className="hr-menu-item">
          <span>▤</span> Applications
        </a>

        <a href="#candidates" className="hr-menu-item">
          <span>♙</span> Candidates
        </a>

        <div className="hr-sidebar-bottom">
          <div className="hr-profile">
            <div className="hr-avatar">HR</div>

            <div>
              <strong>
                {user.name || user.fullName || "HR Manager"}
              </strong>
              <p>HR Administrator</p>
            </div>
          </div>

          <button className="hr-logout-button" onClick={logout}>
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="hr-main">
        {/* Header */}
        <header className="hr-header">
          <div>
            <h1>HR Dashboard</h1>
            <p>
              Manage job applications and discover talented candidates.
            </p>
          </div>

          <button
            className="hr-refresh-button"
            onClick={fetchApplications}
          >
            ↻ Refresh
          </button>
        </header>

        {/* Welcome Banner */}
        <section className="hr-welcome" id="overview">
          <div>
            <span className="hr-welcome-label">
              CAREERCONNECT ADMIN PANEL
            </span>

            <h2>
              Welcome back,{" "}
              {user.name || user.fullName || "HR Manager"}!
            </h2>

            <p>
              Review applications, evaluate candidates, and manage
              recruitment from one place.
            </p>
          </div>

          <div className="hr-welcome-icon">♙</div>
        </section>

        {/* Statistics */}
        <section className="hr-stats">
          <div className="hr-stat-card">
            <div className="hr-stat-icon purple">▤</div>
            <p>Total Applications</p>
            <h2>{totalApplications}</h2>
            <span>All submitted applications</span>
          </div>

          <div className="hr-stat-card">
            <div className="hr-stat-icon orange">◷</div>
            <p>Under Review</p>
            <h2>{underReview}</h2>
            <span>Awaiting a decision</span>
          </div>

          <div className="hr-stat-card">
            <div className="hr-stat-icon green">✓</div>
            <p>Accepted</p>
            <h2>{accepted}</h2>
            <span>Accepted applications</span>
          </div>

          <div className="hr-stat-card">
            <div className="hr-stat-icon red">✕</div>
            <p>Rejected</p>
            <h2>{rejected}</h2>
            <span>Rejected applications</span>
          </div>
        </section>

        {/* About CareerConnect */}
        <section className="hr-about">
          <div className="hr-section-title">
            <div>
              <h2>About CareerConnect</h2>
              <p>Your recruitment management workspace</p>
            </div>
          </div>

          <p className="hr-about-description">
            CareerConnect is a job and internship portal designed to
            connect students and freshers with career opportunities.
            HR managers can review student profiles, check skills,
            view resumes, and update application statuses.
          </p>

          <div className="hr-about-features">
            <div>
              <span>01</span>
              <h3>Review Candidates</h3>
              <p>
                Check student details and application information.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>Evaluate Skills</h3>
              <p>
                Understand candidates' skills and qualifications.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>Manage Applications</h3>
              <p>
                Accept, reject, or review submitted applications.
              </p>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="hr-applications" id="applications">
          <div className="hr-section-title">
            <div>
              <h2>Student Applications</h2>
              <p>
                View and manage applications submitted by students.
              </p>
            </div>

            <span className="hr-total-badge">
              {filteredApplications.length} Applications
            </span>
          </div>

          {/* Search and Filter */}
          <div className="hr-toolbar">
            <input
              type="text"
              placeholder="Search name, email, job or company..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="hr-search-input"
            />

            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="hr-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {message && <div className="hr-success">{message}</div>}
          {error && <div className="hr-error">{error}</div>}

          {/* Applications Table */}
          {loading ? (
            <div className="hr-empty-state">
              <div className="hr-loader"></div>
              <p>Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="hr-empty-state">
              <div className="hr-empty-icon">▤</div>
              <h3>No applications found</h3>
              <p>
                Applications will appear here when students apply for jobs.
              </p>
            </div>
          ) : (
            <div className="hr-table-wrapper">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Details</th>
                    <th>Qualification</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => {
                    const applicant = getApplicant(application);

                    return (
                      <tr key={application._id}>
                        <td>
                          <div className="hr-candidate">
                            <div className="hr-candidate-avatar">
                              {(applicant.name || "S")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {applicant.name || "Student"}
                              </strong>
                              <p>
                                {applicant.email || "Email unavailable"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong>
                            {application.title || "Job Role"}
                          </strong>
                          <p>
                            {application.company ||
                              "Company not specified"}
                          </p>
                          <p>
                            {application.location ||
                              "Location not specified"}
                          </p>
                        </td>

                        <td>
                          <span>
                            {applicant.qualification ||
                              "Not provided"}
                          </span>
                          <p>
                            {applicant.branch || ""}
                          </p>
                        </td>

                        <td>
                          <span
                            className={`hr-status ${
                              application.status === "Accepted"
                                ? "status-accepted"
                                : application.status === "Rejected"
                                ? "status-rejected"
                                : "status-review"
                            }`}
                          >
                            {application.status || "Under Review"}
                          </span>
                        </td>

                        <td>
                          <div className="hr-action-buttons">
                            <button
                              className="hr-view-button"
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                            >
                              View
                            </button>

                            <select
                              className="hr-status-select"
                              value={
                                application.status || "Under Review"
                              }
                              onChange={(event) =>
                                updateStatus(
                                  application._id,
                                  event.target.value
                                )
                              }
                              aria-label="Update application status"
                            >
                              <option value="Under Review">
                                Review
                              </option>
                              <option value="Accepted">Accept</option>
                              <option value="Rejected">Reject</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Candidate Management */}
        <section className="hr-candidates-info" id="candidates">
          <div>
            <h2>Candidate Management</h2>
            <p>
              Inspect student details, qualifications, and recruitment
              status using the applications table.
            </p>
          </div>

          <a href="#applications">View Applications ↑</a>
        </section>

        {/* Footer */}
        <footer className="hr-footer">
          <p>© 2026 CareerConnect. HR Recruitment Dashboard.</p>
          <p>Connecting talent with opportunities.</p>
        </footer>
      </main>

      {/* Student Details Popup */}
      {selectedApplication && (
        <div
          className="hr-modal-overlay"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="hr-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hr-modal-header">
              <div>
                <span className="hr-welcome-label">
                  CANDIDATE PROFILE
                </span>
                <h2>Student Details</h2>
              </div>

              <button
                className="hr-modal-close"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close student details"
              >
                ×
              </button>
            </div>

            {(() => {
              const applicant = getApplicant(selectedApplication);

              const details = [
                ["Full Name", applicant.name],
                ["Email", applicant.email],
                ["Phone", applicant.phone],
                ["College", applicant.college],
                ["Qualification", applicant.qualification],
                ["Branch", applicant.branch],
                ["Graduation Year", applicant.graduationYear],
                ["Skills", applicant.skills],
                ["Experience", applicant.experience],
                ["Location", applicant.location],
                ["Applied Job", selectedApplication.title],
                ["Company", selectedApplication.company],
                [
                  "Application Status",
                  selectedApplication.status || "Under Review",
                ],
              ];

              return (
                <div className="hr-details-grid">
                  {details.map(([label, value]) => (
                    <div className="hr-detail-item" key={label}>
                      <span>{label}</span>
                      <strong>
                        {Array.isArray(value)
                          ? value.join(", ")
                          : value || "Not provided"}
                      </strong>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="hr-modal-footer">
              {selectedApplication.resumePath && (
                <>
                  <button
                    className="hr-modal-secondary"
                    onClick={() =>
                      openResume(selectedApplication.resumePath, "view")
                    }
                  >
                    View Resume
                  </button>
                  <button
                    className="hr-modal-secondary"
                    onClick={() =>
                      openResume(selectedApplication.resumePath, "download")
                    }
                  >
                    Download Resume
                  </button>
                </>
              )}
              <button
                className="hr-modal-secondary"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HRDashboard;