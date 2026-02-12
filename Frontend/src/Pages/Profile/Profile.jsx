// Frontend/src/Pages/Profile/Profile.jsx

import React from "react";
import "./Profile.css";
import Box from "./Box";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import { Link } from "react-router-dom";
import { dummyUsers } from "../../util/dummyData";

const Profile = () => {
  const { user, setUser } = useAuth(); // This is the GLOBAL user
  const [profileUser, setProfileUser] = useState(null); // This is the LOCAL page user
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const navigate = useNavigate();

  // This effect fetches the profile data when the page loads
  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      setProfileUser(null);

      // Check if this is a dummy user first
      const dummyUser = dummyUsers.find(u => u.username === username);
      if (dummyUser) {
        setProfileUser(dummyUser);
        setLoading(false);
        return;
      }

      // Otherwise, fetch from backend
      try {
        const { data } = await axios.get(`/user/registered/getDetails/${username}`);
        setProfileUser(data.data);
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          if (error.response.data.message === "Please Login") {
            setUser(null);
            await axios.get("/auth/logout");
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [username, navigate, setUser]); // This runs when 'username' in URL changes

  // --- THIS IS THE FIX ---
  // This new effect listens for changes to the GLOBAL user
  useEffect(() => {
    // If the global user (from context) changes,
    // AND we are on our own profile page...
    if (user && profileUser && user.username === profileUser.username) {
      //...then sync the local profile state to match the new global state.
      // This will instantly show the new picture.
      setProfileUser(user);
    }
  }, [user, profileUser]); // This runs when 'user' (global) changes
  // -------------------------

  const convertDate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }).replace("/", "-");
    return formattedDate;
  };

  const connectHandler = async () => {
    console.log("Connect");

    // Check if this is a dummy user (no _id means it's from dummyData.js)
    if (!profileUser._id) {
      toast.info("This is a demonstration profile. Connection requests can only be sent to registered users.");
      return;
    }

    try {
      setConnectLoading(true);
      const { data } = await axios.post(`/request/create`, {
        receiverID: profileUser._id,
      });

      console.log(data);
      toast.success(data.message);
      setProfileUser((prevState) => {
        return {
          ...prevState,
          status: "Pending",
        };
      });
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        if (error.response.data.message === "Please Login") {
          setUser(null);
          await axios.get("/auth/logout");
          navigate("/login");
        }
      }
    } finally {
      setConnectLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="container" style={{ minHeight: "86vh" }}>
        {loading ? (
          <div className="row d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {profileUser ? (
              <>
                <div className="profile-box">
                  <div className="left-div">
                    <div className="profile-photo">
                      {/* This 'src' will now update instantly */}
                      <img src={profileUser?.picture || "https://placehold.co/150x150/111/EFECE3?text=A"} alt="Profile" />
                    </div>

                    <div className="misc">
                      <h1 className="profile-name" style={{ marginLeft: "2rem" }}>
                        {profileUser?.name}
                      </h1>

                      <div className="rating" style={{ marginLeft: "2rem" }}>
                        <span className="rating-value">Rating: {profileUser?.rating?.toFixed(1) || "N/A"} ⭐</span>
                      </div>

                      {user?.username !== username && (
                        <div className="buttons">
                          <button
                            className="connect-button"
                            onClick={connectHandler}
                            disabled={connectLoading || profileUser?.status === "Pending" || profileUser?.status === "Accepted"}
                          >
                            {connectLoading
                              ? <Spinner animation="border" size="sm" />
                              : profileUser?.status === "Pending"
                                ? "Request Sent"
                                : profileUser?.status === "Accepted"
                                  ? "Connected"
                                  : "Connect"}
                          </button>
                          <Link to={`/report/${username}`}>
                            <button className="report-button">Report</button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="edit-links">
                    {user?.username === username && (
                      <Link to="/edit_profile">
                        <button className="edit-button">Edit Profile ✎</button>
                      </Link>
                    )}

                    <div className="portfolio-links">
                      {profileUser?.githubLink && (
                        <a href={profileUser.githubLink} target="_blank" rel="noopener noreferrer" className="link portfolio-link">
                          <img src="/assets/images/github.png" alt="Github" />
                        </a>
                      )}
                      {profileUser?.linkedinLink && (
                        <a href={profileUser.linkedinLink} target="_blank" rel="noopener noreferrer" className="link portfolio-link">
                          <img src="/assets/images/linkedin.png" alt="LinkedIn" />
                        </a>
                      )}
                      {profileUser?.portfolioLink && (
                        <a href={profileUser.portfolioLink} target="_blank" rel="noopener noreferrer" className="link portfolio-link">
                          <img src="/assets/images/portfolio.png" alt="Portfolio" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>


                {/* Bio */}
                <h2>Bio</h2>
                <p className="bio">{profileUser?.bio || "No bio provided."}</p>

                {/* Skills */}
                <div className="skills">
                  <h2>Skills Proficient At</h2>
                  <div className="skill-boxes">
                    {profileUser?.skillsProficientAt?.length > 0 ? (
                      profileUser.skillsProficientAt.map((skill, index) => (
                        <div className="skill-box" style={{ fontSize: "16px" }} key={index}>
                          {skill}
                        </div>
                      ))
                    ) : (
                      <p>No skills listed.</p>
                    )}
                  </div>
                </div>

                {/* Skills to Learn */}
                <div className="skills">
                  <h2>Skills To Learn</h2>
                  <div className="skill-boxes">
                    {profileUser?.skillsToLearn?.length > 0 ? (
                      profileUser.skillsToLearn.map((skill, index) => (
                        <div className="skill-box" style={{ fontSize: "16px" }} key={index}>
                          {skill}
                        </div>
                      ))
                    ) : (
                      <p>No skills listed.</p>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="education">
                  <h2>Education</h2>
                  <div className="education-boxes">
                    {profileUser?.education?.length > 0 ? (
                      profileUser.education.map((edu, index) => (
                        <Box
                          key={index}
                          head={edu?.institution}
                          date={convertDate(edu?.startDate) + " - " + convertDate(edu?.endDate)}
                          spec={edu?.degree}
                          desc={edu?.description}
                          score={edu?.score}
                        />
                      ))
                    ) : (
                      <p>No education listed.</p>
                    )}
                  </div>
                </div>

                {/* Projects */}
                {profileUser?.projects && profileUser?.projects.length > 0 && (
                  <div className="projects">
                    <h2>Projects</h2>
                    <div className="project-boxes">
                      {profileUser?.projects?.map((project, index) => (
                        <Box
                          key={index}
                          head={project?.title}
                          date={convertDate(project?.startDate) + " - " + convertDate(project?.endDate)}
                          desc={project?.description}
                          skills={project?.techStack}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="row d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <h2>User not found.</h2>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;