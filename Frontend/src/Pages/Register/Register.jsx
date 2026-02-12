import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import { skills } from "./Skills";
import axios from "axios";
import "./Register.css";
import Badge from "react-bootstrap/Badge";
import { v4 as uuidv4 } from "uuid";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    skillsProficientAt: [],
    skillsToLearn: [],
    education: [
      {
        id: uuidv4(),
        institution: "",
        degree: "",
        startDate: "",
        endDate: "",
        score: "",
        description: "",
      },
    ],
    bio: "",
    projects: [],
  });
  const [skillsProficientAt, setSkillsProficientAt] = useState("Select some skill");
  const [skillsToLearn, setSkillsToLearn] = useState("Select some skill");
  const [techStack, setTechStack] = useState([]);

  const [activeKey, setActiveKey] = useState("registration");

  useEffect(() => {
    setLoading(true);
    const getUser = async () => {
      try {
        const { data } = await axios.get("/user/unregistered/getDetails");
        console.log("User Data: ", data.data);
        const edu = data?.data?.education;
        edu.forEach((ele) => {
          ele.id = uuidv4();
        });
        if (edu.length === 0) {
          edu.push({
            id: uuidv4(),
            institution: "",
            degree: "",
            startDate: "",
            endDate: "",
            score: "",
            description: "",
          });
        }
        const proj = data?.data?.projects;
        if (proj) { // Check if proj exists before processing
             proj.forEach((ele) => {
               ele.id = uuidv4();
            });
            setTechStack(proj.map(() => "Select some Tech Stack")); // Initialize techStack state for each project
        }
        console.log(proj);

        setForm((prevState) => ({
          ...prevState,
          name: data?.data?.name,
          email: data?.data?.email,
          username: data?.data?.username,
          skillsProficientAt: data?.data?.skillsProficientAt,
          skillsToLearn: data?.data?.skillsToLearn,
          linkedinLink: data?.data?.linkedinLink,
          githubLink: data?.data?.githubLink,
          portfolioLink: data?.data?.portfolioLink,
          education: edu,
          bio: data?.data?.bio,
          projects: proj ? proj : prevState.projects,
        }));
      } catch (error) {
        console.error(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          // navigate("/login"); // Commented out as per previous turn fix
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab", "Preview"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prevState) => ({
        ...prevState,
        [name]: checked ? [...prevState[name], value] : prevState[name].filter((item) => item !== value),
      }));
    } else {
      if (name === "bio" && value.length > 500) {
        toast.error("Bio should be less than 500 characters");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
    // console.log("Form: ", form);
  };

  const handleAddSkill = (e) => {
    const { name } = e.target;
    if (name === "skill_to_learn") {
      if (skillsToLearn === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsToLearn.includes(skillsToLearn)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsProficientAt.includes(skillsToLearn)) {
        toast.error("Skill already added in skills proficient at");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: [...prevState.skillsToLearn, skillsToLearn],
      }));
      setSkillsToLearn("Select some skill"); // Reset select
    } else {
      if (skillsProficientAt === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsProficientAt.includes(skillsProficientAt)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsToLearn.includes(skillsProficientAt)) {
        toast.error("Skill already added in skills to learn");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: [...prevState.skillsProficientAt, skillsProficientAt],
      }));
       setSkillsProficientAt("Select some skill"); // Reset select
    }
    // console.log("Form: ", form);
  };

  // Modified handleRemoveSkill to accept skill directly
  const handleRemoveSkill = (skillToRemove, temp) => {
    if (temp === "skills_proficient_at") {
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: prevState.skillsProficientAt.filter((skill) => skill !== skillToRemove),
      }));
    } else {
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: prevState.skillsToLearn.filter((skill) => skill !== skillToRemove),
      }));
    }
    console.log("Form: ", form);
  };

  const handleRemoveEducation = (e, tid) => {
    const updatedEducation = form.education.filter((item) => item.id !== tid);
    console.log("Updated Education: ", updatedEducation);
    setForm((prevState) => ({
      ...prevState,
      education: updatedEducation,
    }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      education: prevState.education.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
    console.log("Form: ", form);
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    console.log("Name", name);
    console.log("Value", value);
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
    console.log("Form: ", form);
  };

  // New handler for removing tech stack from a specific project
  const handleRemoveProjectSkill = (projectIndex, skillToRemove) => {
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) =>
        i === projectIndex
          ? { ...item, techStack: item.techStack.filter((skill) => skill !== skillToRemove) }
          : item
      ),
    }));
  };


  const validateRegForm = () => {
    if (!form.name) {
      toast.error("Name is empty");
      return false;
    }
    if (!form.email) {
      toast.error("Email is empty");
      return false;
    }
    if (!form.username) {
      toast.error("Username is empty");
      return false;
    }
    if (!form.skillsProficientAt.length) {
      toast.error("Enter atleast one Skill you are proficient at");
      return false;
    }
    if (!form.skillsToLearn.length) {
      toast.error("Enter atleast one Skill you want to learn");
      return false;
    }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) {
      toast.error("Enter atleast one link among portfolio, github and linkedin");
      return false;
    }
    const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.githubLink && !githubRegex.test(form.githubLink)) { // Use ! before regex test
      toast.error("Enter a valid github link");
      return false;
    }
    const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.linkedinLink && !linkedinRegex.test(form.linkedinLink)) { // Use ! before regex test
      toast.error("Enter a valid linkedin link");
      return false;
    }
    if (form.portfolioLink && !form.portfolioLink.includes("http")) { // Check if it doesn't include http
      toast.error("Enter a valid portfolio link (must start with http/https)"); // More specific error message
      return false;
    }
    return true;
  };
  const validateEduForm = () => {
    var flag = true;
    form.education.forEach((edu, index) => {
      if (!edu.institution) {
        toast.error(`Institution name is empty in education field ${index + 1}`);
        flag = false;
      }
      if (!edu.degree) {
        toast.error(`Degree is empty in education field ${index + 1}`);
        flag = false;
      }
      if (!edu.startDate) {
        toast.error(`Start date is empty in education field ${index + 1}`);
        flag = false;
      }
      if (!edu.endDate) {
        toast.error(`End date is empty in education field ${index + 1}`);
        flag = false;
      }
      if (!edu.score) {
        toast.error(`Score is empty in education field ${index + 1}`);
        flag = false;
      }
      // Basic date validation - checking if start date is before end date
      if (edu.startDate && edu.endDate && new Date(edu.startDate) > new Date(edu.endDate)) {
        toast.error(`Start Date should be less than End Date in education field ${index + 1}`);
        flag = false;
      }
      // Add check for valid score if needed (e.g., between 0-100)
      // if (edu.score !== "" && (parseFloat(edu.score) < 0 || parseFloat(edu.score) > 100)) {
      //   toast.error(`Score must be between 0 and 100 in education field ${index + 1}`);
      //   flag = false;
      // }
    });
    return flag;
  };
  const validateAddForm = async () => { // Keep async because it might be needed later, though not currently
    if (!form.bio) {
      toast.error("Bio is empty");
      return false;
    }
    if (form.bio.length > 500) {
      toast.error("Bio should be less than 500 characters");
      return false;
    }
    var flag = true;
    form.projects.forEach((project, index) => {
      if (!project.title) {
        toast.error(`Title is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.techStack.length) {
        toast.error(`Tech Stack is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.startDate) {
        toast.error(`Start Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.endDate) {
        toast.error(`End Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.projectLink) {
        toast.error(`Project Link is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.description) {
        toast.error(`Description is empty in project ${index + 1}`);
        flag = false;
      }
       // Basic date validation for projects
      if (project.startDate && project.endDate && new Date(project.startDate) > new Date(project.endDate)) {
        toast.error(`Start Date should be less than End Date in project ${index + 1}`);
        flag = false;
      }
      // More robust URL validation for project link
      try {
        new URL(project.projectLink);
      } catch (e) {
         toast.error(`Please provide a valid URL for project link in project ${index + 1}`);
         flag = false;
      }
    });
    return flag;
  };

  const handleSaveRegistration = async () => {
    const check = validateRegForm();
    if (check) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveRegDetails", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };
  const handleSaveEducation = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    if (check1 && check2) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveEduDetail", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };
  const handleSaveAdditional = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = await validateAddForm(); // Await the async validation
    console.log(check1, check2, check3);
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveAddDetail", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = await validateAddForm(); // Await the async validation
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/registerUser", form);
        toast.success("Registration Successful");
        console.log("Data: ", data.data);
        navigate("/discover");
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  return (
    <div className="register_page ">
      <h1 className="m-4" style={{ fontFamily: "Oswald", color: "#3BB4A1" }}>
        Registration Form
      </h1>
      {loading ? (
        <div className="row m-auto w-100 d-flex justify-content-center align-items-center" style={{ height: "80.8vh" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="register_section mb-3">
          <Tabs
            defaultActiveKey="registration"
            id="justify-tab-example"
            className="mb-3"
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
          >
            <Tab eventKey="registration" title="Registration">
              {/* Name */}
              <div>
                <label style={{ color: "#3BB4A1" }}>Name</label>
                <br />
                <input
                  type="text"
                  name="name"
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  value={form.name}
                />
              </div>
              {/* Email */}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Email
                </label>
                <br />
                <input
                  type="text"
                  name="email"
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  value={form.email}
                />
              </div>
              {/* Username */}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Username
                </label>
                <br />
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  value={form.username}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Enter your username"
                />
              </div>
              {/* Linkedin Profile Link*/}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Linkedin Link
                </label>
                <br />
                <input
                  type="text"
                  name="linkedinLink"
                  value={form.linkedinLink}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Enter your Linkedin link"
                />
              </div>
              {/* Github Profile Link*/}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Github Link
                </label>
                <br />
                <input
                  type="text"
                  name="githubLink"
                  value={form.githubLink}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Enter your Github link"
                />
              </div>
              {/* Portfolio Link */}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Portfolio Link
                </label>
                <br />
                <input
                  type="text"
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Enter your portfolio link"
                />
              </div>
              {/* Skills Proficient At */}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Skills Proficient At
                </label>
                <br />
                <Form.Select
                  aria-label="Select some skill"
                  value={skillsProficientAt}
                  onChange={(e) => setSkillsProficientAt(e.target.value)}
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={skill} value={skill}> {/* Using skill as key */}
                      {skill}
                    </option>
                  ))}
                </Form.Select>
                {form.skillsProficientAt.length > 0 && (
                  <div>
                    {form.skillsProficientAt.map((skill, index) => (
                      <Badge
                        key={skill} // Using skill as key
                        bg="secondary"
                        className="ms-2 mt-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveSkill(skill, "skills_proficient_at")} // Pass skill value directly
                      >
                        <div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div>
                      </Badge>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary mt-3 ms-1" name="skill_proficient_at" onClick={handleAddSkill}>
                  Add Skill
                </button>
              </div>
              {/* Skills to learn */}
              <div>
                <label style={{ color: "#3BB4A1", marginTop: "20px" }}>Skills To Learn</label>
                <br />
                <Form.Select
                  aria-label="Select some skill"
                  value={skillsToLearn}
                  onChange={(e) => setSkillsToLearn(e.target.value)}
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={skill} value={skill}> {/* Using skill as key */}
                      {skill}
                    </option>
                  ))}
                </Form.Select>
                {form.skillsToLearn.length > 0 && (
                  <div>
                    {form.skillsToLearn.map((skill, index) => (
                      <Badge
                        key={skill} // Using skill as key
                        bg="secondary"
                        className="ms-2 mt-2 "
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveSkill(skill, "skills_to_learn")} // Pass skill value directly
                      >
                        <div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div>
                      </Badge>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary mt-3 ms-1" name="skill_to_learn" onClick={handleAddSkill}>
                  Add Skill
                </button>
              </div>
              <div className="row m-auto d-flex justify-content-center mt-3">
                <button className="btn btn-warning" onClick={handleSaveRegistration} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}
                </button>
                <button onClick={handleNext} className="mt-2 btn btn-primary">
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="education" title="Education">
              {form.education.map((edu, index) => (
                <div className="border border-dark rounded-1 p-3 m-1" key={edu.id}>
                  {/* Consider using an icon here instead of text "cross" */}
                  {form.education.length > 1 && ( // Only show remove if more than one entry
                    <span className="w-100 d-flex justify-content-end">
                      <button className="w-25" onClick={(e) => handleRemoveEducation(e, edu.id)}>
                        cross {/* Replace with icon */}
                      </button>
                    </span>
                  )}
                  <label style={{ color: "#3BB4A1" }}>Institution Name</label>
                  <br />
                  <input
                    type="text"
                    name="institution"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #3BB4A1",
                      padding: "5px",
                      width: "100%",
                    }}
                    placeholder="Enter your institution name"
                  />
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>
                    Degree
                  </label>
                  <br />
                  <input
                    type="text"
                    name="degree"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #3BB4A1",
                      padding: "5px",
                      width: "100%",
                    }}
                    placeholder="Enter your degree"
                  />
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>
                    Grade/Percentage
                  </label>
                  <br />
                  <input
                    type="number"
                    name="score"
                    value={edu.score}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #3BB4A1",
                      padding: "5px",
                      width: "100%",
                    }}
                    placeholder="Enter your grade/percentage"
                  />
                  <div className="row w-100">
                    <div className="col-md-6">
                      <label className="mt-2" style={{ color: "#3BB4A1" }}>
                        Start Date
                      </label>
                      <br />
                      <input
                        type="date"
                        name="startDate"
                        value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={{
                          borderRadius: "5px",
                          border: "1px solid #3BB4A1",
                          padding: "5px",
                          width: "100%",
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="mt-2" style={{ color: "#3BB4A1" }}>
                        End Date
                      </label>
                      <br />
                      <input
                        type="date"
                        name="endDate"
                        value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={{
                          borderRadius: "5px",
                          border: "1px solid #3BB4A1",
                          padding: "5px",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>
                    Description
                  </label>
                  <br />
                  <input
                    type="text"
                    name="description"
                    value={edu.description}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #3BB4A1",
                      padding: "5px",
                      width: "100%",
                    }}
                    placeholder="Enter your exp or achievements"
                  />
                </div>
              ))}
              <div className="row my-2 d-flex justify-content-center">
                <button
                  className="btn btn-primary w-50"
                  onClick={() => {
                    setForm((prevState) => ({
                      ...prevState,
                      education: [
                        ...prevState.education,
                        {
                          id: uuidv4(),
                          institution: "",
                          degree: "",
                          startDate: "",
                          endDate: "",
                          score: "",
                          description: "",
                        },
                      ],
                    }));
                  }}
                >
                  Add Education
                </button>
              </div>
              <div className="row m-auto d-flex justify-content-center mt-3">
                <button className="btn btn-warning" onClick={handleSaveEducation} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}
                </button>
                <button onClick={handleNext} className="mt-2 btn btn-primary">
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="longer-tab" title="Additional">
              <div>
                <label style={{ color: "#3BB4A1", marginTop: "20px" }}>Bio (Max 500 Character)</label>
                <br />
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                  placeholder="Enter your bio"
                ></textarea>
              </div>
              <div className="">
                <label style={{ color: "#3BB4A1" }}>Projects</label>

                {form.projects.map((project, index) => (
                  <div className="border border-dark rounded-1 p-3 m-1" key={project.id}>
                     {/* Consider using an icon here instead of text "cross" */}
                    {form.projects.length > 0 && ( // Only show remove if at least one project
                       <span className="w-100 d-flex justify-content-end">
                        <button
                          className="w-25"
                          onClick={() => {
                            setForm((prevState) => ({
                              ...prevState,
                              projects: prevState.projects.filter((item) => item.id !== project.id),
                            }));
                            // Also remove the corresponding techStack select state for this project
                            setTechStack(prevState => prevState.filter((_, i) => i !== index));
                          }}
                        >
                          cross {/* Replace with icon */}
                        </button>
                       </span>
                    )}
                    <label style={{ color: "#3BB4A1" }}>Title</label>
                    <br />
                    <input
                      type="text"
                      name="title"
                      value={project.title}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={{
                        borderRadius: "5px",
                        border: "1px solid #3BB4A1",
                        padding: "5px",
                        width: "100%",
                      }}
                      placeholder="Enter your project title"
                    />
                    <label className="mt-2" style={{ color: "#3BB4A1" }}>
                      Tech Stack
                    </label>
                    <br />
                    <Form.Select
                      aria-label="Select some Tech Stack"
                      value={techStack[index]} // Use the correct techStack state element
                      onChange={(e) => {
                        // Update the specific techStack select value for this project index
                        setTechStack((prevState) => prevState.map((item, i) => (i === index ? e.target.value : item)));
                      }}
                    >
                      <option>Select some Tech Stack</option>
                      {skills.map((skill) => ( // Using skill as key
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </Form.Select>
                    {/* Check project's techStack length, not the temporary select state */}
                    {form.projects[index]?.techStack.length > 0 && (
                      <div>
                        {form.projects[index].techStack.map((skill) => ( // Using skill as key
                          <Badge
                            key={skill} // Using skill as key
                            bg="secondary"
                            className="ms-2 mt-2"
                            style={{ cursor: "pointer" }}
                             onClick={() => handleRemoveProjectSkill(index, skill)} // Use new handler
                          >
                            <div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <button
                      className="btn btn-primary mt-3 ms-1"
                      name="tech_stack"
                       onClick={() => { // Use arrow function to capture index
                        if (techStack[index] === "Select some Tech Stack") {
                          toast.error("Select a tech stack to add");
                          return;
                        }
                        // Access the techStack value for the specific project index
                        const selectedTech = techStack[index];
                        if (form.projects[index].techStack.includes(selectedTech)) {
                          toast.error("Tech Stack already added");
                          return;
                        }
                        setForm((prevState) => ({
                          ...prevState,
                          projects: prevState.projects.map((item, i) =>
                            i === index ? { ...item, techStack: [...item.techStack, selectedTech] } : item
                          ),
                        }));
                         // Reset the select value for this project index after adding
                         setTechStack(prevState => prevState.map((item, i) => (i === index ? "Select some Tech Stack" : item)));
                      }}
                    >
                      Add Tech Stack
                    </button>
                    <div className="row">
                      <div className="col-md-6">
                        <label className="mt-2" style={{ color: "#3BB4A1" }}>
                          Start Date
                        </label>
                        <br />
                        <input
                          type="date"
                          name="startDate"
                          value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={{
                            borderRadius: "5px",
                            border: "1px solid #3BB4A1",
                            padding: "5px",
                            width: "100%",
                          }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="mt-2" style={{ color: "#3BB4A1" }}>
                          End Date
                        </label>
                        <br />
                        <input
                          type="date"
                          name="endDate"
                          value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={{
                            borderRadius: "5px",
                            border: "1px solid #3BB4A1",
                            padding: "5px",
                            width: "100%",
                          }}
                        />
                      </div>
                    </div>
                    <label className="mt-2" style={{ color: "#3BB4A1" }}>
                      Project Link
                    </label>
                    <br />
                    <input
                      type="text"
                      name="projectLink"
                      value={project.projectLink}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={{
                        borderRadius: "5px",
                        border: "1px solid #3BB4A1",
                        padding: "5px",
                        width: "100%",
                      }}
                      placeholder="Enter your project link"
                    />

                    <label className="mt-2" style={{ color: "#3BB4A1" }}>
                      Description
                    </label>
                    <br />
                    <input
                      type="text"
                      name="description"
                      value={project.description}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={{
                        borderRadius: "5px",
                        border: "1px solid #3BB4A1",
                        padding: "5px",
                        width: "100%",
                      }}
                      placeholder="Enter your project description"
                    />
                  </div>
                ))}

                <div className="row my-2 d-flex justify-content-center">
                  <button
                    className="btn btn-primary w-50"
                    onClick={() => {
                      setTechStack((prevState) => {
                        return [...prevState, "Select some Tech Stack"];
                      });
                      setForm((prevState) => ({
                        ...prevState,
                        projects: [
                          ...prevState.projects,
                          {
                            id: uuidv4(),
                            title: "",
                            techStack: [],
                            startDate: "",
                            endDate: "",
                            projectLink: "",
                            description: "",
                          },
                        ],
                      }));
                    }}
                  >
                    Add Project
                  </button>
                </div>
              </div>
              <div className="row m-auto d-flex justify-content-center mt-3">
                <button className="btn btn-warning" onClick={handleSaveAdditional} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}
                </button>
                <button onClick={handleNext} className="mt-2 btn btn-primary">
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="Preview" title="Confirm Details">
              <div>
                <h3 style={{ color: "#3BB4A1", marginBottom: "20px" }} className="link w-100 text-center">
                  Preview of the Form
                </h3>
                <div className="previewForm" style={{ fontFamily: "Montserrat, sans-serif", color: "#2d2d2d", marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link m-sm-0"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Name:</span>
                    <span style={{ flex: 2 }}>{form.name || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Email ID:</span>
                    <span style={{ flex: 2 }}>{form.email || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Username:</span>
                    <span style={{ flex: 2 }}>{form.username || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Portfolio Link:</span>
                    <span style={{ flex: 2 }}>{form.portfolioLink || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Github Link:</span>
                    <span style={{ flex: 2 }}>{form.githubLink || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      marginBottom: "10px",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Linkedin Link:</span>
                    <span
                      style={{
                        width: "70vw",
                        alignItems: "center",
                        flex: 2,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {form.linkedinLink || "Yet to be filled"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Skills Proficient At:</span>
                    <span style={{ flex: 2 }}>{form.skillsProficientAt.join(", ") || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Skills To Learn:</span>
                    <span style={{ flex: 2 }}>{form.skillsToLearn.join(", ") || "Yet to be filled"}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Bio:</span>
                    <span style={{ flex: 2 }}>{form.bio || "Yet to be filled"}</span>
                  </div>
                </div>
                <div className="row">
                  <button
                    onClick={handleSubmit}
                    style={{
                      backgroundColor: "#3BB4A1",
                      color: "white",
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    className="w-50 d-flex m-auto text-center align-content-center justify-content-center"
                     disabled={saveLoading} // Also disable during loading
                  >
                    {saveLoading ? <Spinner animation="border" variant="primary" /> : "Submit"}
                  </button>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Register;