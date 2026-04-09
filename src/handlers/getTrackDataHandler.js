const { getTrackData } = require('../services/getTrackData');

async function getTrackDataHandler(req, res) {
  const payload = await getTrackData(req.params.track);

  res.json(payload);
}

module.exports = {
  getTrackDataHandler
};
