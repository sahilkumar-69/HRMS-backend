import teamModel from "../models/team.model.js";
import { userModel } from "../models/User.model.js";
import { sendNotification } from "../utils/sendNotification.js";
// Create a new team
const createTeam = async (req, res) => {
  try {
    const { FirstName, LastName } = req.user;
    const { name, description, lead, members } = req.body;

    // Validate lead exists
    const leadUser = await userModel.findById(lead);
    if (!leadUser || leadUser.Role !== "TL") {
      return res.status(400).json({ message: "Invalid team lead" });
    }

    // Create team
    const team = new teamModel({
      name,
      description,
      lead,
      members,
      createdBy: req.user._id, // HR or Owner
    });
    await team.save();

    // Update each member's JoinedTeams
    const teamMembers = await userModel.find({ _id: { $in: members } });
    await Promise.all(
      teamMembers.map(async (member) => {
        member.JoinedTeams.push(team._id);
        await member.save();
      })
    );

    // Send notifications (real-time + DB)
    await sendNotification({
      recipients: members.map((id) => id.toString()),
      title: "New Team",
      message: `${FirstName} ${LastName} added you to a new team "${name}"`,
      data: {
        teamId: team._id,
        teamLead: `${leadUser.FirstName} ${leadUser.LastName}`,
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "Team created successfully", team });
  } catch (error) {
    if (team?._id) {
      await teamModel.findByIdAndDelete(team._id); // rollback safely
    }

    return res
      .status(500)
      .json({ message: "Error creating team", error: error.message });
  }
};
// Get teams (with members)
const getAllTeams = async (req, res) => {
  try {
    const teams = await teamModel
      .find()
      .populate("lead", "FirstName LastName Email Role")
      .populate("members", "FirstName LastName Email Role");

    res.status(201).json({ Success: true, teams });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching teams", error: error.message });
  }
};

const getTeamsById = async (req, res) => {
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

    const team = await teamModel
      .findOne(query)
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

const getJoinedTeams = async (req, res) => {
  try {
    const { Role } = req.user;

    const { id } = req.params;

    // if (user.Role === "TL") {
    // }

    if (!id) {
      res.json({
        message: "param not found",
        success: false,
      });
    }

    const teams = await teamModel
      .find({
        $or: [
          {
            lead: id,
          },
          {
            members: id,
          },
        ],
      }) // checks if userId exists in array
      // .find({ members: id }) // checks if userId exists in array
      .populate("lead", "FirstName LastName Email") // populate lead details
      .populate("members", "FirstName LastName Email"); // optional: populate members

    res.json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    res.json({
      message: error.message,
      success: false,
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let team = await teamModel.findById(id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    //  validate lead
    if (updates.lead) {
      const leadExists = await userModel.findById(updates.lead);
      if (!leadExists) {
        return res.status(400).json({ message: "Invalid lead userId" });
      }
    }

    //  validate members
    if (updates.members && updates.members.length > 0) {
      const membersExist = await userModel.find({
        _id: { $in: updates.members },
      });
      if (membersExist.length !== updates.members.length) {
        return res.status(400).json({ message: "Some members not found" });
      }
    }

    //  merge updates instead of replace
    Object.assign(team, updates);
    await team.save();

    //  re-populate
    team = await teamModel
      .findById(id)
      .populate("lead", "FirstName LastName Role Email")
      .populate("members", "FirstName LastName Role Email");

    //  prepare notification
    const notificationParams = {
      recipient: team.members.map((m) => m._id.toString()), // notify all members
      message: `Team "${team.name}" has been updated.`,
      title: "Team Update",
      data: {
        teamId: team._id,
        updatedFields: updates, // optional: include which fields changed
      },
    };

    await sendNotification(notificationParams);

    res.json({ message: "Team updated successfully", team });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating team", error: error.message });
  }
};

const addMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userIds } = req.body;
    const { FirstName, LastName, Role } = req.user;

    if (Role !== "TL" && Role !== "ADMIN") {
      return res.json({
        message: "Only team lead or admin can make changes to the team",
        success: false,
      });
    }

    const updatedTeam = await teamModel
      .findByIdAndUpdate(
        teamId,
        { $addToSet: { members: { $each: userIds } } },
        { new: true }
      )
      .populate("members", "FirstName LastName Email")
      .populate("lead", "FirstName LastName Email");

    if (!updatedTeam) {
      return res.json({ message: "Team not found", success: false });
    }

    await userModel.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { JoinedTeams: teamId } }
    );

    //  notification logic
    const notificationParams = {
      recipient: userIds.map((id) => id.toString()),
      message: `${FirstName} ${LastName} added you to team "${updatedTeam.name}"`,
      title: "Added to Team",
      data: {
        teamId: updatedTeam._id,
        teamLead: `${updatedTeam.lead.FirstName} ${updatedTeam.lead.LastName}`,
      },
    };

    await sendNotification(notificationParams); // handles both online & offline

    return res.json({ success: true, team: updatedTeam });
  } catch (error) {
    return res.json({ success: false, message: error.message, error });
  }
};

const removeMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.json({
        message: "userIds are missing or not an array",
        success: false,
      });
    }

    //  Update team by removing members
    const updatedTeam = await teamModel
      .findByIdAndUpdate(
        teamId,
        { $pull: { members: { $in: userIds } } },
        { new: true }
      )
      .populate("members", "FirstName LastName Email");

    if (!updatedTeam) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    //  Remove team from users’ JoinedTeams
    await userModel.updateMany(
      { _id: { $in: userIds } },
      { $pull: { JoinedTeams: teamId } }
    );

    //  Persist notification for offline users too
    const notificationParams = {
      recipient: userIds.map((id) => id.toString()),
      title: "Removed from Team",
      message: `${req.user.FirstName} ${req.user.LastName} removed you from the team "${updatedTeam.name}"`,
      data: { teamId: updatedTeam._id },
    };
    await sendNotification(notificationParams);

    return res.json({
      success: true,
      updatedTeam,
    });
  } catch (error) {
    res.json({
      message: error.message,
      success: false,
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { Role, FirstName, LastName } = req.user;

    //  Role check (expand as needed)
    if (!["TL", "ADMIN"].includes(Role)) {
      return res.json({
        message: "Only Team Lead or Admin can delete a team",
        success: false,
      });
    }

    if (!teamId) {
      return res.json({
        message: "teamId is required",
        success: false,
      });
    }

    const deletedTeam = await teamModel.findByIdAndDelete(teamId);

    if (!deletedTeam) {
      return res.json({
        message: "Team not found",
        success: false,
      });
    }

    //  Remove team reference from members
    await Promise.all(
      deletedTeam.members.map((memberId) =>
        userModel.findByIdAndUpdate(memberId, {
          $pull: { JoinedTeams: teamId },
        })
      )
    );

    //  Send notifications to all members
    const notificationParams = {
      recipient: deletedTeam.members.map((id) => id.toString()),
      title: "Team Deleted",
      message: `${FirstName} ${LastName} deleted the team "${deletedTeam.name}"`,
      data: {
        teamId: deletedTeam._id,
      },
    };

    await sendNotification(notificationParams);

    return res.json({
      success: true,
      message: "Team deleted successfully",
      deletedTeam,
    });
  } catch (error) {
    return res.json({
      message: error.message,
      success: false,
    });
  }
};

export {
  createTeam,
  updateTeam,
  getAllTeams,
  getTeamsById,
  getJoinedTeams,
  addMembers,
  removeMembers,
  deleteTeam,
};
