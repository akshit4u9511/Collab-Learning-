import { useEffect, useState, useCallback, useRef } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../../socket";
import ScrollableFeed from "react-scrollable-feed";
import { dummyUsers } from "../../util/dummyData";
import "./Chats.css";

const Chats = () => {
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [showRequests, setShowRequests] = useState(false);

  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);

  const [scheduleModalShow, setScheduleModalShow] = useState(false);

  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);

  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoChatMessages, setDemoChatMessages] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
  });

  const fetchChats = useCallback(async () => {
    try {
      setChatLoading(true);
      const { data } = await axios.get("/chat");
      toast.success(data.message);

      if (user?._id) {
        const formatted = data.data.map((chat) => {
          const partner = chat.users.find((u) => u._id !== user._id);
          return {
            id: chat._id,
            name: partner?.name || "Unknown",
            picture: partner?.picture,
            username: partner?.username || "unknown",
          };
        });
        setChats(formatted);
      }
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          setUser(null);
          axios.get("/auth/logout").then(() => navigate("/login"));
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setChatLoading(false);
    }
  }, [setUser, navigate, user]);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  useEffect(() => {
    if (!user || !socket) return;

    socket.emit("setup", user);

    const onMessageReceived = (newMessageRecieved) => {
      if (selectedChat && selectedChat.id === newMessageRecieved.chatId?._id) {
        setChatMessages((prev) => [...prev, newMessageRecieved]);
      }
    };

    socket.on("message recieved", onMessageReceived);

    return () => {
      socket.off("message recieved", onMessageReceived);
    };
  }, [selectedChat, user]);

  const handleScheduleClick = () => setScheduleModalShow(true);

  const handleChatClick = async (chatId) => {
    // Demo mode - load from local storage
    if (isDemoMode) {
      const demoChats = dummyUsers.map(u => ({
        id: `demo-${u.username}`,
        name: u.name,
        picture: u.picture,
        username: u.username,
        isDemo: true
      }));
      const chatDetails = demoChats.find((chat) => chat.id === chatId);
      setSelectedChat(chatDetails);
      setChatMessages(demoChatMessages[chatId] || []);
      setMessage("");
      return;
    }

    // Real mode - fetch from backend
    try {
      setChatMessageLoading(true);
      const { data } = await axios.get(`/message/getMessages/${chatId}`);
      setChatMessages(data.data);
      setMessage("");

      const chatDetails = chats.find((chat) => chat.id === chatId);
      setSelectedChat(chatDetails);
      socket.emit("join chat", chatId);
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          setUser(null);
          axios.get("/auth/logout").then(() => navigate("/login"));
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setChatMessageLoading(false);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === "" && !selectedFile) {
      toast.error("Message or file is required");
      return;
    }

    // Demo mode - store message locally
    if (isDemoMode && selectedChat) {
      const newMessage = {
        _id: Date.now().toString(),
        sender: { _id: user._id, name: user.name },
        content: message,
        timestamp: new Date(),
        type: "text"
      };

      // Handle file if selected
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileMessage = {
            ...newMessage,
            type: selectedFile.type.startsWith("image/") ? "image" : "file",
            fileData: e.target.result,
            fileName: selectedFile.name,
            content: message || `Sent ${selectedFile.name}`
          };

          setChatMessages((prev) => [...prev, fileMessage]);
          setDemoChatMessages(prev => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), fileMessage]
          }));
          setMessage("");
          clearFileSelection();
          toast.success("Message sent (Demo)");
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setChatMessages((prev) => [...prev, newMessage]);
        setDemoChatMessages(prev => ({
          ...prev,
          [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
        }));
        setMessage("");
        toast.success("Message sent (Demo)");
      }
      return;
    }

    // Real mode - send to backend
    try {
      socket.emit("stop typing", selectedChat.id);
      const { data } = await axios.post("/message/sendMessage", {
        chatId: selectedChat.id,
        content: message,
      });

      socket.emit("new message", data.data);
      setChatMessages((prev) => [...prev, data.data]);
      setMessage("");
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          setUser(null);
          await axios.get("/auth/logout");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  // --- THIS IS THE CORRECTED FUNCTION ---
  const getRequests = useCallback(async () => {
    try {
      setRequestLoading(true);
      const { data } = await axios.get("/request/getRequests");

      // Format the data to prevent crash
      if (user?._id && data.data) {
        const formattedRequests = data.data.map((req) => {
          // Assuming the request object has a 'sender' field populated
          // This creates the 'name' property our render code expects
          const sender = req.sender;
          return {
            _id: req._id,
            name: sender?.name || "Unknown User", // The name to display
            picture: sender?.picture,
            username: sender?.username || "unknown",
            originalRequest: req // keep the original object
          };
        });
        setRequests(formattedRequests); // Set the *formatted* requests
      } else {
        setRequests(data.data || []);
      }

      toast.success(data.message);
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          setUser(null);
          axios.get("/auth/logout").then(() => navigate("/login"));
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setRequestLoading(false);
    }
  }, [user, setUser, navigate]); // Added dependencies

  const handleTabClick = async (tab) => {
    if (tab === "chat") {
      setShowChatHistory(true);
      setShowRequests(false);
      setSelectedChat(null);
      await fetchChats();
    } else {
      setShowChatHistory(false);
      setShowRequests(true);
      setSelectedChat(null);
      await getRequests();
    }
  };

  const handleStartChat = () => {
    // Activate demo mode with dummy users
    setIsDemoMode(true);
    setShowChatHistory(true);
    setShowRequests(false);
    setSelectedChat(null);
    setChatMessages([]);
    toast.info("Demo Mode: You can now chat with demo users!");
  };

  const handleExitDemoMode = () => {
    setIsDemoMode(false);
    setSelectedChat(null);
    setChatMessages([]);
    setDemoChatMessages({});
    fetchChats();
    toast.info("Exited demo mode. Showing your real chats.");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
  };

  return (
    <div className="container-overall">
      <div className="container-right">
        <div className="container-left">
          <div className="p-3" style={{ borderBottom: "1px solid #3bb4a1" }}>
            {isDemoMode ? (
              <Button
                variant="danger"
                onClick={handleExitDemoMode}
                style={{
                  width: "100%",
                  backgroundColor: "#ff6b6b",
                  borderColor: "#ff6b6b",
                  color: "white",
                  fontWeight: "bold",
                  padding: "12px",
                  fontSize: "1.1rem",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              >
                🔙 Exit Demo Mode
              </Button>
            ) : (
              <Button
                variant="info"
                onClick={handleStartChat}
                style={{
                  width: "100%",
                  backgroundColor: "#3bb4a1",
                  borderColor: "#3bb4a1",
                  color: "white",
                  fontWeight: "bold",
                  padding: "12px",
                  fontSize: "1.1rem",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              >
                ✨ Start New Chat
              </Button>
            )}
          </div>

          <div className="tabs">
            <Button
              variant="secondary"
              style={{
                backgroundColor: showChatHistory ? "#3bb4a1" : "#2d2d2d",
                color: showChatHistory ? "black" : "white",
                borderRadius: "5px 5px 0 0",
              }}
              onClick={() => handleTabClick("chat")}
            >
              Chat History
            </Button>
            <Button
              variant="secondary"
              style={{
                backgroundColor: showRequests ? "#3bb4a1" : "#2d2d2d",
                color: showRequests ? "black" : "white",
                borderRadius: "5px 5px 0 0",
              }}
              onClick={() => handleTabClick("requests")}
            >
              Requests
            </Button>
          </div>

          {showChatHistory && (
            <ListGroup className="chat-list">
              {isDemoMode ? (
                dummyUsers.map((user) => {
                  const demoId = `demo-${user.username}`;
                  return (
                    <ListGroup.Item
                      key={demoId}
                      onClick={() => handleChatClick(demoId)}
                      style={{
                        cursor: "pointer",
                        marginBottom: "10px",
                        padding: "10px",
                        backgroundColor: selectedChat?.id === demoId ? "#3BB4A1" : "lightgrey",
                        borderRadius: "5px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={user.picture}
                          alt={user.name}
                          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                        />
                        <div>
                          <div style={{ fontWeight: "bold" }}>{user.name}</div>
                          <div style={{ fontSize: "0.85rem", color: "#666" }}>@{user.username}</div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })
              ) : chatLoading ? (
                <div className="row m-auto mt-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                chats.map((chat) => (
                  <ListGroup.Item
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    style={{
                      cursor: "pointer",
                      marginBottom: "10px",
                      padding: "10px",
                      backgroundColor: selectedChat?.id === chat.id ? "#3BB4A1" : "lightgrey",
                      borderRadius: "5px",
                    }}
                  >
                    {chat.name}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          )}
          {showRequests && (
            <ListGroup style={{ padding: "10px" }}>
              {requestLoading ? (
                <div className="row m-auto mt-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                // This 'req.name' will now work because we formatted it in getRequests
                requests.map((req) => (
                  <ListGroup.Item
                    key={req._id}
                    onClick={() => handleRequestClick(req)}
                    style={{
                      cursor: "pointer",
                      marginBottom: "10px",
                      padding: "10px",
                      backgroundColor:
                        selectedRequest && selectedRequest._id === req._id ? "#3BB4A1" : "lightgrey",
                      borderRadius: "5px",
                    }}
                  >
                    {req.name}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          )}
        </div>

        <div className="container-chat">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center", // Align items vertically
              padding: "10px",
              borderBottom: "1px solid #2d2d2d",
              minHeight: "50px",
            }}
          >
            {selectedChat && (
              <>
                <div>
                  <img
                    src={selectedChat.picture || "https://via.placeholder.com/150"}
                    alt="Profile"
                    style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                  />
                  <span style={{ fontFamily: "Montserrat, sans-serif", color: "#2d2d2d", fontWeight: "bold" }}>
                    {selectedChat.username}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link to={`/call/${selectedChat.id}`}>
                    <Button variant="success">
                      Start Live Call
                    </Button>
                  </Link>
                  <Button variant="info" onClick={handleScheduleClick}>
                    Request Video Call
                  </Button>
                </div>
              </>
            )}
          </div>

          <div style={{ flex: 7, position: "relative", height: "calc(100vh - 160px)" }}>
            <div
              style={{
                height: "calc(100% - 50px)",
                color: "#3BB4A1",
                padding: "20px",
                overflowY: "auto",
              }}
            >
              {selectedChat ? (
                <ScrollableFeed>
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: msg.sender._id === user._id ? "flex-end" : "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: msg.sender._id === user._id ? "#3BB4A1" : "#2d2d2d",
                          color: "#fff",
                          padding: "10px",
                          borderRadius: "10px",
                          maxWidth: "70%",
                          textAlign: msg.sender._id === user._id ? "right" : "left",
                        }}
                      >
                        {msg.type === "image" ? (
                          <div>
                            <img
                              src={msg.fileData}
                              alt="Shared image"
                              style={{ maxWidth: "100%", borderRadius: "8px", marginBottom: "5px" }}
                            />
                            {msg.content && <div>{msg.content}</div>}
                          </div>
                        ) : msg.type === "file" ? (
                          <div>
                            <div style={{ fontSize: "0.9rem", marginBottom: "3px" }}>📎 File:</div>
                            <div style={{ fontWeight: "bold" }}>{msg.fileName}</div>
                            {msg.content && <div style={{ marginTop: "5px" }}>{msg.content}</div>}
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}
                </ScrollableFeed>
              ) : (
                <div className="row w-100 h-100 d-flex justify-content-center align-items-center">
                  {chatMessageLoading ? (
                    <Spinner animation="border" variant="primary" />
                  ) : (
                    <h3>Select a chat to start messaging</h3>
                  )}
                </div>
              )}
            </div>

            {selectedChat && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "10px",
                  borderTop: "1px solid #2d2d2d",
                }}
              >
                {selectedFile && (
                  <div style={{
                    padding: "8px",
                    marginBottom: "8px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <span>📎 {selectedFile.name}</span>
                    <Button size="sm" variant="danger" onClick={clearFileSelection}>✕</Button>
                  </div>
                )}
                <div style={{ display: "flex" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ marginRight: "10px" }}
                    title="Attach file or image"
                  >
                    📎
                  </Button>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "5px",
                      marginRight: "10px",
                      border: "1px solid #2d2d2d",
                    }}
                  />
                  <Button variant="success" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {scheduleModalShow && (
        <div className="modalBG" onClick={() => setScheduleModalShow(false)}>
          <div
            className="modalContent"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#2d2d2d",
              color: "#3BB4A1",
              padding: "40px",
              borderRadius: "10px",
            }}
          >
            <h3>Request a Meeting</h3>
            <Form>
              <Form.Group controlId="formDate" style={{ marginBottom: "20px" }}>
                <Form.Label>Preferred Date</Form.Label>
                <Form.Control
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                />
              </Form.Group>

              <Form.Group controlId="formTime" style={{ marginBottom: "20px" }}>
                <Form.Label>Preferred Time</Form.Label>
                <Form.Control
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                />
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                onClick={async (e) => {
                  e.preventDefault();
                  if (!scheduleForm.date || !scheduleForm.time) {
                    toast.error("Please fill all the fields");
                    return;
                  }
                  try {
                    const { data } = await axios.post("/user/sendScheduleMeet", {
                      ...scheduleForm,
                      username: selectedChat?.username,
                    });
                    toast.success(data.message || "Request mail sent!");
                    setScheduleForm({ date: "", time: "" });
                    setScheduleModalShow(false);
                  } catch (err) {
                    console.error(err);
                    if (err?.response?.data?.message) {
                      toast.error(err.response.data.message);
                      if (err.response.data.message === "Please Login") {
                        setUser(null);
                        await axios.get("/auth/logout");
                        navigate("/login");
                      }
                    } else {
                      toast.error("Something went wrong");
                    }
                  }
                }}
              >
                Submit
              </Button>
              <Button
                variant="danger"
                onClick={() => setScheduleModalShow(false)}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </Button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;