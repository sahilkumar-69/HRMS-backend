import teamModel from "../models/team.model.js";
import { userModel } from "../models/User.model.js";

// Create a new team
const createTeam = async (req, res) => {
  try {
    const { name, description, lead, members } = req.body;

    // Validate lead exists
    const leadUser = await userModel.findById(lead);

    if (!leadUser || leadUser.Role !== "TL") {
      return res.status(400).json({ message: "Invalid team lead" });
    }

    var team = new teamModel({
      name,
      description,
      lead,
      members,
      createdBy: req.user._id, // HR or Owner
    });

    await team.save();

    const teamMembers = await userModel.find({ _id: { $in: members } });

    await Promise.all(
      teamMembers.map(async (member) => {
        member.JoinedTeams.push(team._id);
        await member.save();
      })
    );
    // console.log(teamMembers);

    res
      .status(201)
      .json({ success: true, message: "Team created successfully", team });
  } catch (error) {
    await teamModel.findByIdAndDelete(team._id);

    res
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

    team = await teamModel
      .findById(id)
      .populate("lead", "FirstName LastName Role Email")
      .populate("members", "FirstName LastName Role Email");

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
    console.log(userIds);

    if (req.user.Role === "EMPLOYEE" || req.user.Role === "HR") {
      return res.json({
        message: "Only team lead or admin can made changes to the team",
        success: false,
      });
    }

    const updatedTeam = await teamModel
      .findByIdAndUpdate(
        teamId,
        {
          $addToSet: { members: { $each: userIds } },
        },
        {
          new: true,
        }
      )
      .populate("members", "FirstName LastName Email");

    if (!updatedTeam)
      return res.json({
        message: "team not found",
        success: false,
      });

    const updatedUser = await userModel
      .updateMany(
        { _id: { $in: userIds } },
        {
          $addToSet: {
            JoinedTeams: teamId,
          },
        }
      )
      .select("JoinedTeams");

    console.log(updatedUser);

    return res.json({ success: true, team: updatedTeam });
  } catch (error) {
    return res.json({ success: false, message: error.message, error });
  }
};

const removeMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const { userIds } = req.body;

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

    await userModel.updateMany(
      { _id: { $in: userIds } },
      { $pull: { JoinedTeams: teamId } }
    );

    res.json({
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

    const { Role } = req.user;

    if (Role !== "TL")
      return res.json({
        message: "Only Team Lead can delete team",
        success: false,
      });

    if (!teamId)
      return res.json({
        message: "teamId is required",
        success: false,
      });

    const deletedTeam = await teamModel.findByIdAndDelete(teamId);

    if (deletedTeam) {
      await Promise.all(
        deletedTeam.members.map((memberId) => {
          userModel.findByIdAndUpdate(memberId, {
            $pull: { JoinedTeams: teamId },
          });
        })
      );
    }

    res.json({
      success: true,
      deletedTeam,
    });
  } catch (error) {
    res.json({
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
