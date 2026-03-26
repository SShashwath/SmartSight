// GET /api/transport
const getTransport = (req, res) => {
  const { destination } = req.query;

  const mockBuses = [
    {
      id: 'BUS-401',
      route: 'Majestic → Whitefield',
      busNumber: '401',
      nextArrival: '3 minutes',
      platform: 'Platform 4',
      accessible: true,
      stops: ['Majestic', 'Indiranagar', 'Domlur', 'Marathahalli', 'Whitefield'],
    },
    {
      id: 'BUS-500C',
      route: 'Silk Board → KR Puram',
      busNumber: '500C',
      nextArrival: '7 minutes',
      platform: 'Platform 2',
      accessible: true,
      stops: ['Silk Board', 'BTM Layout', 'Koramangala', 'Domlur', 'KR Puram'],
    },
    {
      id: 'METRO-GREEN',
      route: 'Nagasandra → Silk Board (Metro)',
      busNumber: 'GREEN LINE',
      nextArrival: '2 minutes',
      platform: 'Metro Platform 1',
      accessible: true,
      type: 'metro',
      stops: ['Nagasandra', 'Yeshwanthpur', 'Majestic', 'KR Market', 'Jayanagar', 'Silk Board'],
    },
    {
      id: 'BUS-335E',
      route: 'Kempegowda → Electronic City',
      busNumber: '335E',
      nextArrival: '12 minutes',
      platform: 'Platform 7',
      accessible: false,
      stops: ['Kempegowda', 'Jayanagar', 'Banashankari', 'BTM', 'Electronic City'],
    },
    {
      id: 'METRO-PURPLE',
      route: 'Baiyappanahalli → Mysuru Road (Metro)',
      busNumber: 'PURPLE LINE',
      nextArrival: '4 minutes',
      platform: 'Metro Platform 2',
      accessible: true,
      type: 'metro',
      stops: ['Baiyappanahalli', 'Indiranagar', 'Halasuru', 'Trinity', 'Majestic', 'Mysuru Road'],
    },
  ];

  const announcements = [
    '🚌 Bus 401 is running 3 minutes late due to traffic at Silk Board junction.',
    '🚇 Green Line Metro: Reduced frequency from 9 PM onwards.',
    '♿ All Metro stations have wheelchair ramps and tactile paths available.',
    '📍 Real-time tracking available for all BMTC buses via the SmartSight app.',
  ];

  res.json({
    success: true,
    timestamp: new Date(),
    location: 'Bengaluru, Karnataka',
    destination: destination || 'All routes',
    buses: mockBuses,
    announcements,
    accessibility_info: {
      wheelchairAccessible: mockBuses.filter(b => b.accessible).length,
      totalRoutes: mockBuses.length,
      note: 'All metro stations and most major bus stops have tactile ground surface indicators.',
    },
  });
};

// GET /api/transport/navigation
const getNavigation = (req, res) => {
  const { from, to } = req.query;

  const destination = to || 'your destination';
  const origin = from || 'your current location';

  const steps = [
    { step: 1, instruction: `Start at ${origin}. Face north towards the main road.`, distance: '0 m', duration: '0 min' },
    { step: 2, instruction: 'Walk straight ahead for approximately 50 meters. You will pass a pharmacy on your right.', distance: '50 m', duration: '1 min' },
    { step: 3, instruction: 'Turn right at the intersection. Listen for the pedestrian crossing signal.', distance: '10 m', duration: '1 min' },
    { step: 4, instruction: 'Cross the road when you hear the beeping signal. The crossing is 8 meters wide.', distance: '8 m', duration: '1 min' },
    { step: 5, instruction: 'Continue straight for 200 meters. There is a slight slope downhill.', distance: '200 m', duration: '3 min' },
    { step: 6, instruction: 'You will reach the bus stop on your left. There are tactile paving strips to guide you.', distance: '20 m', duration: '1 min' },
    { step: 7, instruction: `You have arrived at ${destination}. The entrance is directly in front of you.`, distance: '0 m', duration: '0 min' },
  ];

  res.json({
    success: true,
    from: origin,
    to: destination,
    totalDistance: '288 m',
    totalDuration: '7 minutes',
    steps,
    tips: [
      'Stay close to the left wall for guidance.',
      'Listen for audio beacons at each crossing.',
      'SmartSight will announce each step automatically.',
    ],
  });
};

module.exports = { getTransport, getNavigation };
