// API Service

import { SUPABASE_CONFIG } from "../constant/Constant";

export const apiService = {
  async fetchLeaderboard() {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.URL}/rest/v1/scores?select=*`,
        {
          headers: {
            apikey: SUPABASE_CONFIG.KEY,
            Authorization: `Bearer ${SUPABASE_CONFIG.KEY}`,
          },
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      const topScoresMap = {};
      for (const entry of data) {
        if (
          !topScoresMap[entry.name] ||
          entry.score > topScoresMap[entry.name].score
        ) {
          topScoresMap[entry.name] = entry;
        }
      }
      const uniqueTopScores = Object.values(topScoresMap);
      return uniqueTopScores.sort((a, b) => b.score - a.score).slice(0, 5);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      return [];
    }
  },

  async saveScore(username, score) {
    try {
      const existingResponse = await fetch(
        `${SUPABASE_CONFIG.URL}/rest/v1/scores?name=eq.${username}`,
        {
          headers: {
            apikey: SUPABASE_CONFIG.KEY,
            Authorization: `Bearer ${SUPABASE_CONFIG.KEY}`,
          },
        }
      );
      if (!existingResponse.ok)
        throw new Error("Failed to check existing score");
      const existingData = await existingResponse.json();

      if (existingData.length === 0 || score > existingData[0].score) {
        await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/scores`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_CONFIG.KEY,
            Authorization: `Bearer ${SUPABASE_CONFIG.KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({ name: username, score }),
        });
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  },
};
