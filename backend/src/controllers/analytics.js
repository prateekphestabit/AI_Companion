const User = require("../models/User");
const logger = require("../utils/logger");

async function getAnalytics(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("companions");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const companions = user.companions;

    // ── Per-companion stats ──
    const companionStats = companions.map((comp) => {

      comp = {...comp.toObject()}
      if (comp.avatar){
        let bufferData = null;
        if (Buffer.isBuffer(comp.avatar)) {
          bufferData = comp.avatar;
        } else if (comp.avatar.buffer) {
          bufferData = comp.avatar.buffer;
        }
        if (bufferData) {
          comp.avatar = `data:image/png;base64,${bufferData.toString('base64')}`;
        }
      }

      const totalConversations = comp.history.length;
      let totalMessages = 0;
      let userMessages = 0;
      let assistantMessages = 0;
      let longestConversation = 0;
      let shortestConversation = Infinity;
      const dailyActivity = {};
      const weeklyActivity = {};

      comp.history.forEach((h) => {
        const msgCount = h.chatHistory.length;
        totalMessages += msgCount;

        if (msgCount > longestConversation) longestConversation = msgCount;
        if (msgCount < shortestConversation) shortestConversation = msgCount;

        h.chatHistory.forEach((msg) => {
          if (msg.role === "user") userMessages++;
          else if (msg.role === "assistant") assistantMessages++;
        });

        // Daily activity
        if (h.createdAt) {
          const dateKey = new Date(h.createdAt).toISOString().split("T")[0];
          dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1;

          // Weekly activity (day of week: 0=Sun … 6=Sat)
          const dayOfWeek = new Date(h.createdAt).getDay();
          weeklyActivity[dayOfWeek] = (weeklyActivity[dayOfWeek] || 0) + 1;
        }
      });

      if (shortestConversation === Infinity) shortestConversation = 0;

      const avgConversationLength =
        totalConversations > 0
          ? Math.round((totalMessages / totalConversations))
          : 0;

      // Last active
      let lastActive = null;
      if (comp.history.length > 0) {
        const dates = comp.history
          .map((h) => h.updatedAt || h.createdAt)
          .filter(Boolean)
          .map((d) => new Date(d).getTime());
        if (dates.length > 0) lastActive = new Date(Math.max(...dates));
      }

      return {
        companionId: comp._id,
        name: comp.name,
        avatar: comp.avatar,
        personality: comp.personality,
        expertise: comp.expertise,
        totalConversations,
        totalMessages,
        userMessages,
        assistantMessages,
        avgConversationLength,
        longestConversation,
        shortestConversation,
        lastActive,
        dailyActivity,
        weeklyActivity,
      };
    });

    // ── Overall stats ──
    const totalConversations = companionStats.reduce(
      (sum, c) => sum + c.totalConversations,
      0
    );
    const totalMessages = companionStats.reduce(
      (sum, c) => sum + c.totalMessages,
      0
    );
    const totalUserMessages = companionStats.reduce(
      (sum, c) => sum + c.userMessages,
      0
    );
    const totalAssistantMessages = companionStats.reduce(
      (sum, c) => sum + c.assistantMessages,
      0
    );
    const overallAvgLength =
      totalConversations > 0
        ? Math.round((totalMessages / totalConversations) * 10) / 10
        : 0;

    // Most active companion
    const mostActive =
      companionStats.length > 0
        ? companionStats.reduce((prev, curr) =>
            curr.totalMessages > prev.totalMessages ? curr : prev
          )
        : null;

    // ── Global daily timeline ──
    const globalTimeline = {};
    companionStats.forEach((c) => {
      Object.entries(c.dailyActivity).forEach(([date, count]) => {
        globalTimeline[date] = (globalTimeline[date] || 0) + count;
      });
    });

    // Convert to sorted array
    const timelineArray = Object.entries(globalTimeline)
      .map(([date, conversations]) => ({ date, conversations }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── Weekly heatmap data ──
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const globalWeekly = {};
    companionStats.forEach((c) => {
      Object.entries(c.weeklyActivity).forEach(([day, count]) => {
        globalWeekly[day] = (globalWeekly[day] || 0) + count;
      });
    });
    const weeklyArray = dayNames.map((name, i) => ({
      day: name,
      conversations: globalWeekly[i] || 0,
    }));

    res.status(200).json({
      success: true,
      overview: {
        totalCompanions: companions.length,
        totalConversations,
        totalMessages,
        totalUserMessages,
        totalAssistantMessages,
        overallAvgLength,
        mostActiveCompanion: mostActive
          ? { name: mostActive.name, totalMessages: mostActive.totalMessages }
          : null,
      },
      companionStats,
      timeline: timelineArray,
      weeklyActivity: weeklyArray,
    });
  } catch (error) {
    logger.error("Error in getAnalytics", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = { getAnalytics };
