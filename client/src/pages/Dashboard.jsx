import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    apiFetch("/campaigns")
      .then(setCampaigns)
      .catch((error) => setError(error.message));
  }, []);

  async function handleCreateCampaign(event) {
    event.preventDefault();

    try {
      const campaign = await apiFetch("/campaigns", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });

      setCampaigns([...campaigns, campaign]);
      setTitle("");
      setDescription("");
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

  function startEditingCampaign(campaign) {
    setEditingCampaignId(campaign.id);
    setEditTitle(campaign.title);
    setEditDescription(campaign.description || "");
  }

  function cancelEditingCampaign() {
    setEditingCampaignId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function updateCampaign(event, campaignId) {
    event.preventDefault();

    try {
      const updatedCampaign = await apiFetch(`/campaigns/${campaignId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      setCampaigns(
        campaigns.map((campaign) =>
          campaign.id === campaignId ? updatedCampaign : campaign
        )
      );

      cancelEditingCampaign();
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }
  async function deleteCampaign(campaignId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this campaign? This will also delete its tasks and notes."
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      setCampaigns(
        campaigns.filter((campaign) => campaign.id !== campaignId)
      );

      setError("");
    } catch (error) {
      setError(error.message);
    }
  }
  return (
    <main>
      <div className="page-header">
        <h1>DM Dashboard</h1>
        <p>Manage your campaigns and prepare for upcoming sessions.</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleCreateCampaign}>
        <h2>Create Campaign</h2>

        <label>Campaign Title</label>
        <input
          value={title}
          placeholder="Curse of the Forgotten King"
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <label>Campaign Description</label>
        <textarea
          value={description}
          placeholder="Describe your campaign, story, setting, or adventure..."
          onChange={(event) => setDescription(event.target.value)}
        />

        <button type="submit">Create Campaign</button>
      </form>

      <h2>Your Campaigns</h2>

      <div className="campaign-grid">
        {campaigns.map((campaign) => (
          <article key={campaign.id}>
            {editingCampaignId === campaign.id ? (
              <form onSubmit={(event) => updateCampaign(event, campaign.id)}>
                <h3>Edit Campaign</h3>

                <label>Campaign Title</label>
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  required
                />

                <label>Campaign Description</label>
                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                />

                <button type="submit">Save Changes</button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelEditingCampaign}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h3>{campaign.title}</h3>
                <span className="status">{campaign.status}</span>

                <p>
                  {campaign.description || "No campaign description yet."}
                </p>

                <div className="card-actions">
                  <Link
                    className="link-button"
                    to={`/campaigns/${campaign.id}`}
                  >
                    Open Campaign
                  </Link>

                  <button
                    type="button"
                    onClick={() => startEditingCampaign(campaign)}
                  >
                    Edit Campaign
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => deleteCampaign(campaign.id)}
                  >
                    Delete Campaign
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;