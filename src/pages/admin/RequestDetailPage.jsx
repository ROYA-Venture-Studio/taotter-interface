import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAdminQuestionnaireWithSprintQuery } from "../../store/api/questionnairesApi";
import ResponseModal from "../../components/ui/ResponseModal/ResponseModal";
import "./RequestDetailPage.css";
import { useStartChatMutation } from "../../store/api/chatApi";

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [startChat] = useStartChatMutation();
  const { data, isLoading, error } = useGetAdminQuestionnaireWithSprintQuery(id);

  // Loading and error states
  if (isLoading) {
    return <div style={{ padding: 32 }}>Loading...</div>;
  }
  if (error || !data?.data?.questionnaire) {
    return (
      <div style={{ padding: 32, color: "red" }}>
        Error loading request details. {error?.data?.message || ""}
      </div>
    );
  }

  const q = data.data.questionnaire;
  const sprint = data.data.sprint;

  // Data mapping
  const dealId = q._id ? q._id.toString().slice(-8).toUpperCase() : "";
  const startup = q.startupId || {};
  const customer = {
    name:
      startup.profile
        ? `${startup.profile.founderFirstName || ""} ${startup.profile.founderLastName || ""}`.trim()
        : "",
    avatar: "/assets/icons/User.svg",
    subtitle: startup.profile?.companyName || "",
  };
  const product = q.basicInfo?.taskType || "";
  const value = q.requirements?.budgetRange || "";
  const closeDate = q.requirements?.timeline || "";
  const status = q.status || "";
  const startupName = q.basicInfo?.startupName || "";
  const taskName = q.basicInfo?.taskType || "";
  const stage = q.basicInfo?.startupStage || "";
  const timeDedicated = q.basicInfo?.timeCommitment || "";
  const taskDescription = q.basicInfo?.taskDescription || "";
  const keyGoals = q.basicInfo?.keyGoals || "";
  const milestone = {
    name: (q.requirements?.milestones && q.requirements.milestones[0]) || "",
    timeline: q.requirements?.timeline || "",
    budget: q.requirements?.budgetRange || "",
  };

  // Extract sprint attachments, contact, and demoLink if available
  let attachments = [];
  let contact = "";
  let demoLink = "";
  if (sprint && sprint.sprintDocuments) {
    attachments = Array.isArray(sprint.sprintDocuments.uploadedFiles)
      ? sprint.sprintDocuments.uploadedFiles.map((doc) => ({
          name: doc.originalName || doc.fileName,
          file: doc.fileUrl,
          type: doc.fileType,
        }))
      : [];
    contact = sprint.sprintDocuments.contactLists || "";
    demoLink = sprint.sprintDocuments.appDemo || "";
  }
  return (
    <div className="request-detail-page">
      <div className="request-detail-breadcrumb">
        <span className="request-detail-breadcrumb-title">Requests</span>
        <div className="request-detail-breadcrumb-path">
          <span className="request-detail-breadcrumb-home" onClick={() => navigate("/admin/sprints")}>Home</span>
          <span className="request-detail-breadcrumb-arrow">{">"}</span>
          <span className="request-detail-breadcrumb-current">Requests</span>
        </div>
      </div>
      <div className="request-detail-header">
        <div>
          <span className="request-detail-deal-label">Request ID</span>
          <span className="request-detail-deal-id">{dealId}</span>
        </div>
        <div className="request-detail-header-actions">
          <button
            className="request-detail-action-btn"
            onClick={async () => {
              if (!startup?._id) return;
              try {
                const res = await startChat({ startupId: startup._id }).unwrap();
                const chatId = res?.data?.chat?._id;
                if (chatId) {
                  navigate(`/admin/chat/${chatId}`);
                }
              } catch (err) {
                alert("Failed to start chat");
              }
            }}
          >
            Chat
          </button>
          <button className="request-detail-action-btn primary" onClick={() => setShowModal(true)}>Respond</button>
        </div>
      </div>
      <div className="request-detail-section request-detail-section-personal">
        <h2 className="request-detail-section-title">Personal Information</h2>
        <div className="request-detail-info">
          <div className="request-detail-info-col">
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Startup Name</span>
              <span className="request-detail-info-value">{startupName}</span>
            </div>
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Name of Task</span>
              <span className="request-detail-info-value">{taskName}</span>
            </div>
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Stage</span>
              <span className="request-detail-info-value">{stage}</span>
            </div>
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Time dedicated to startup</span>
              <span className="request-detail-info-value">{timeDedicated}</span>
            </div>
          </div>
          <div className="request-detail-info-col">
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Task Description</span>
              <span className="request-detail-info-value">{taskDescription}</span>
            </div>
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Key Goals</span>
              <span className="request-detail-info-value">{keyGoals}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="request-detail-section request-detail-section-milestone">
        <h2 className="request-detail-section-title">Milestone</h2>
        <div className="request-detail-milestone">
          <div>
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Milestone</span>
              <span className="request-detail-info-value">{milestone.name}</span>
            </div>
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Timeline</span>
              <span className="request-detail-info-value">{milestone.timeline}</span>
            </div>
          </div>
          <div>
            <div className="request-detail-info-group">
              <span className="request-detail-info-label">Budget</span>
              <span className="request-detail-info-value">{milestone.budget}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="request-detail-section request-detail-section-attachments">
        <h2 className="request-detail-section-title">Attachments</h2>
        <div className="request-detail-attachments">
          {attachments.map((att, i) => {
            function getFileIcon(filename) {
              const ext = filename.split('.').pop().toLowerCase();
              if (['doc', 'docx', 'ppt', 'pptx', 'txt', 'csv', 'xls', 'xlsx'].includes(ext)) return "/assets/icons/file - text.svg";
              if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return "/assets/icons/file-image.svg";
              if (ext === 'pdf') return "/assets/icons/file-pdf.svg";
              return "/assets/icons/file - text.svg";
            }
            return (
              <div className="request-detail-attachment" key={i} style={{ display: "flex", alignItems: "baseline" }}>
                <img src={getFileIcon(att.name)} alt="icon" style={{ width: 20, marginRight: 8 }} />
                <a
                  className="request-detail-attachment-link"
                  href={att.file}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {att.name}
                </a>
              </div>
            );
          })}
        </div>
        <div className="request-detail-info-group">
          <span className="request-detail-info-label">Existing teacher contact</span>
          <span className="request-detail-info-value">{contact}</span>
        </div>
        <div className="request-detail-info-group">
          <span className="request-detail-info-label">Demo Link</span>
          <a className="request-detail-info-value" href={demoLink} target="_blank" rel="noopener noreferrer">{demoLink}</a>
        </div>
      </div>
      {showModal && <ResponseModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
