import Team from "../models/team.js";
import { userModel as User } from "../models/User.model.js";

// Create a new team
const createTeam = async (req, res) => {
  try {
    const { name, description, lead, members } = req.body;

    // Validate lead exists
    const leadUser = await User.findById(lead);
    if (!leadUser || leadUser.Role !== "TL") {
      return res.status(400).json({ message: "Invalid team lead" });
    }

    const team = new Team({
      name,
      description,
      lead,
      members,
      createdBy: req.user.id, // HR or Owner
    });

    await team.save();
    res
      .status(201)
      .json({ success: true, message: "Team created successfully", team });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating team", error: error.message });
  }
};
// Get teams (with members)
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("lead", "FirstName LastName Email Role")
      .populate("members", "FirstName LastName Email Role");

    res.status(201).json({ Success: true, teams });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching teams", error: error.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // assuming auth middleware attaches user info (id, role)

    let query = { _id: id };

    //   Restrict Employees & TLs to only their teams
    if (user.Role === "EMPLOYEE" || user.Role === "TL") {
      query = {
        _id: id,
        $or: [
          { lead: user._id }, // if TL is the lead
          { members: user._id }, // if Employee is a member
        ],
      };
    }

    const team = await Team.findOne(query)
      .populate("lead", "FirstName LastName Email Role")
      .populate("members", "FirstName LastName Email Role");

    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found or access denied" });
    }

    res.status(201).json({ success: true, team });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching team", error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // ✅ validate lead
    if (updates.lead) {
      const leadExists = await userModel.findById(updates.lead);
      if (!leadExists) {
        return res.status(400).json({ message: "Invalid lead userId" });
      }
    }

    // ✅ validate members
    if (updates.members && updates.members.length > 0) {
      const membersExist = await userModel.find({
        _id: { $in: updates.members },
      });
      if (membersExist.length !== updates.members.length) {
        return res.status(400).json({ message: "Some members not found" });
      }
    }

    // ✅ merge updates instead of replace
    Object.assign(team, updates);
    await team.save();

    team = await Team.findById(id)
      .populate("lead", "FirstName LastName Role Email")
      .populate("members", "FirstName LastName Role Email");

    res.json({ message: "Team updated successfully", team });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating team", error: error.message });
  }
};

export { createTeam, updateTeam, getTeams, getTeamById };
