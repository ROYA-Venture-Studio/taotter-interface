import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAdminQuestionnaireWithSprintQuery } from "../../store/api/questionnairesApi";
import { useGetAllSprintsQuery } from "../../store/api/sprintsApi";
import ResponseModal from "../../components/ui/ResponseModal/ResponseModal";
import "./RequestDetailPage.css";
import { useStartChatMutation } from "../../store/api/chatApi";

// ProposalSection component (copied from RequestsPage)
function ProposalSection({ sprints }) {
  const [openSprint, setOpenSprint] = useState(null);
  const [activeTier, setActiveTier] = useState({});

  if (!sprints || sprints.length === 0) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: "#101828" }}>Proposals Sent</h2>
      {sprints.map((sprint, idx) => (
        <div key={sprint.id || sprint._id} style={{ marginBottom: 24, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>
          <div
            style={{
              padding: "16px 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #e5e7eb"
            }}
            onClick={() => setOpenSprint(openSprint === idx ? null : idx)}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Sprint {idx + 1}: {sprint.name}</div>
              <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>
                Estimated Time: {sprint.estimatedDuration} weeks
              </div>
            </div>
          </div>
          {openSprint === idx && (
            <div style={{ padding: "18px 20px" }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 500, fontSize: 15, color: "#101828", marginBottom: 8 }}>
                  Sprint Objective: {sprint.packageOptions?.[0]?.description || sprint.description || 'No objective available'}
                </div>
                <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>
                  <strong>Deliverables:</strong>
                  <br />
                  {Array.isArray(sprint.deliverables) ? (
                    <ul>
                      {sprint.deliverables.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{sprint.deliverables}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>
                  ⚠ Estimated Total Hours: {(sprint.estimatedDuration || 0) * 30} working hours
                </div>
              </div>
              {/* Tier Tabs */}
              <div style={{ marginTop: 18 }}>
                <div style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 10,
                  borderRadius: "8px",
                  background: "#f3f4f6",
                  padding: "6px 8px"
                }}>
                  {sprint.packageOptions && sprint.packageOptions.map((pkg, pkgIdx) => {
                    const isActive = activeTier[sprint._id || sprint.id] === pkgIdx;
                    return (
                      <button
                        key={pkg.tier || pkgIdx}
                        style={{
                          background: isActive ? "#fff" : "transparent",
                          color: isActive ? "#EB5E28" : "#222",
                          border: isActive ? "2px solid #EB5E28" : "none",
                          borderRadius: "6px",
                          fontWeight: 600,
                          fontSize: 14,
                          padding: "8px 20px",
                          cursor: "pointer",
                          boxShadow: isActive ? "0 2px 8px rgba(235,94,40,0.08)" : "none",
                          transition: "background 0.2s, color 0.2s, border 0.2s"
                        }}
                        onClick={() => setActiveTier({ ...activeTier, [sprint._id || sprint.id]: pkgIdx })}
                      >
                        {pkg.name || pkg.tier}
                      </button>
                    );
                  })}
                </div>
                {/* Tier Details */}
                {sprint.packageOptions && typeof activeTier[sprint._id || sprint.id] === "number" && (
                  <div style={{ padding: "14px 0", borderTop: "1px solid #e5e7eb" }}>
                    {(() => {
                      const pkg = sprint.packageOptions[activeTier[sprint._id || sprint.id]];
                      if (!pkg) return null;
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {/* First row: Hourly Rate & Amount */}
                          <div style={{ display: "flex", gap: "32px" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Hourly Rate</div>
                              <input
                                type="text"
                                disabled
                                value={pkg.hourlyRate ? `${pkg.hourlyRate} QAR` : "-"}
                                style={{
                                  height: "44px",
                                  width: "100%",
                                  border: "1px solid #D0D5DD",
                                  borderRadius: "8px",
                                  background: "#F9FAFB",
                                  color: "#667085",
                                  fontSize: 14,
                                  padding: "0 12px",
                                  fontWeight: 500,
                                  pointerEvents: "none"
                                }}
                              />
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, alignSelf: "center" }}>Amount</div>
                              <input
                                type="text"
                                disabled
                                value={pkg.amount ? `${pkg.amount} QAR` : "-"}
                                style={{
                                  height: "44px",
                                  width: "100%",
                                  border: "1px solid #D0D5DD",
                                  borderRadius: "8px",
                                  background: "#F9FAFB",
                                  color: "#667085",
                                  fontSize: 14,
                                  padding: "0 12px",
                                  fontWeight: 500,
                                  pointerEvents: "none"
                                }}
                              />
                            </div>
                          </div>
                          {/* Second row: QTY & Discount */}
                          <div style={{ display: "flex", gap: "32px" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>QTY</div>
                              <input
                                type="text"
                                disabled
                                value={pkg.QTY ?? "-"}
                                style={{
                                  height: "44px",
                                  width: "100%",
                                  border: "1px solid #D0D5DD",
                                  borderRadius: "8px",
                                  background: "#F9FAFB",
                                  color: "#667085",
                                  fontSize: 14,
                                  padding: "0 12px",
                                  fontWeight: 500,
                                  pointerEvents: "none"
                                }}
                              />
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, alignSelf: "center" }}>Discount</div>
                              <input
                                type="text"
                                disabled
                                value={pkg.discount ? `${pkg.discount}%` : "-"}
                                style={{
                                  height: "44px",
                                  width: "100%",
                                  border: "1px solid #D0D5DD",
                                  borderRadius: "8px",
                                  background: "#F9FAFB",
                                  color: "#667085",
                                  fontSize: 14,
                                  padding: "0 12px",
                                  fontWeight: 500,
                                  pointerEvents: "none"
                                }}
                              />
                            </div>
                          </div>
                          {/* Third row: Payment Link */}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Payment Link</div>
                            <input
                              type="text"
                              disabled
                              value={pkg.paymentLink || ""}
                              style={{
                                height: "44px",
                                width: "100%",
                                border: "1px solid #D0D5DD",
                                borderRadius: "8px",
                                background: "#F9FAFB",
                                color: "#EB5E28",
                                fontSize: 14,
                                padding: "0 12px",
                                fontWeight: 600,
                                pointerEvents: "none"
                              }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [startChat] = useStartChatMutation();
  const { data, isLoading, error } = useGetAdminQuestionnaireWithSprintQuery(id);
  const { data: sprintsData, isLoading: sprintsLoading } = useGetAllSprintsQuery({ questionnaireId: id });

  // Loading and error states
  if (isLoading || sprintsLoading) {
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
  // Filter sprints to only those for this questionnaire/request
  const sprints = (sprintsData?.data?.sprints || []).filter(
    sprint => sprint.questionnaire && (sprint.questionnaire._id === id || sprint.questionnaire.id === id)
  );

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
      {/* Proposals Sent Section */}
      <ProposalSection sprints={sprints} />
      <div className="request-detail-section request-detail-section-attachments">
        <h2 className="request-detail-section-title">Attachments</h2>
        {(attachments.length > 0 || contact || demoLink) ? (
          <>
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
            {contact && (
              <div>
                <span className="request-detail-info-label">Existing contact</span>
                <span className="request-detail-info-value">{contact}</span>
              </div>
            )}
            {demoLink && (
              <div>
                <span className="request-detail-info-label">Demo Link</span>
                <a className="request-detail-info-value" href={demoLink} target="_blank" rel="noopener noreferrer">{demoLink}</a>
              </div>
            )}
          </>
        ) : (
          <div>
            <span>No Attachments Uploaded.</span>
          </div>
        )}
      </div>
      {showModal && <ResponseModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
