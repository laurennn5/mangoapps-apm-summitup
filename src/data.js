export const stores = [
  { id: 'downtown', name: 'Downtown', employees: 44, address: '120 Market Street' },
  { id: 'westside', name: 'Westside', employees: 38, address: '845 West Avenue' },
  { id: 'riverside', name: 'Riverside', employees: 42, address: '62 River Road' },
  { id: 'northgate', name: 'Northgate', employees: 40, address: '310 Northgate Drive' },
  { id: 'oakwood', name: 'Oakwood', employees: 36, address: '18 Oakwood Lane' },
];
const managers = ['Jordan Lee', 'Morgan Chen', 'Alex Rivera', 'Taylor Brooks', 'Sam Patel'];
const firstNames = ['Avery', 'Jamie', 'Riley', 'Casey', 'Drew', 'Quinn', 'Parker', 'Cameron', 'Emerson', 'Skyler'];
const lastNames = ['Johnson', 'Garcia', 'Williams', 'Kim', 'Davis', 'Wilson', 'Martinez', 'Anderson', 'Thomas', 'Nguyen'];
export const employees = stores.flatMap((store, si) => Array.from({ length: store.employees }, (_, i) => ({
  id: `${store.id}-${i}`, storeId: store.id,
  name: i === 0 ? managers[si] : i === 1 && si === 0 ? 'Avery Johnson' : `${firstNames[(i + si) % 10]} ${lastNames[(Math.floor(i / 10) + si) % 10]}`,
  role: i === 0 ? 'manager' : 'employee', title: i === 0 ? 'Store manager' : ['Sales associate', 'Customer experience associate', 'Stock associate', 'Shift lead'][i % 4],
})));
export const demoIdentities = stores.flatMap(store => employees.filter(person => person.storeId === store.id).slice(0, 2));
export const announcements = [
  { id: 1, title: 'A safer store starts with all of us', body: 'Our updated emergency procedures are here. Please review the new evacuation routes and assembly points before your next shift. Printed guides are also available in the break room.', category: 'Safety & operations', important: true, author: 'Jordan Lee', authorRole: 'Store manager', date: 'Nov 4, 2026', time: '9:00 AM', storeIds: ['downtown'], icon: 'shield', detail: 'Emergency procedures · November 2026', attachment: 'Emergency procedures.pdf', attachmentSize: '1.2 MB' },
  { id: 2, title: 'Holiday hours: a little planning goes a long way', body: 'The holiday season is almost here! Our updated store hours are ready. Take a look at the schedule and chat with your manager if you have any questions about availability.', category: 'Scheduling', important: true, author: 'Priya Shah', authorRole: 'People & culture', date: 'Nov 3, 2026', time: '2:30 PM', storeIds: [], icon: 'calendar', detail: 'Holiday trading hours · All stores' },
  { id: 3, title: 'Big smiles. Small moments. Great teamwork.', body: 'A huge thank-you to everyone who helped make our weekend customer appreciation event a success. You brought the energy, the care, and the extra mile. That’s the Summit spirit.', category: 'Team spotlight', important: false, author: 'Priya Shah', authorRole: 'People & culture', date: 'Nov 3, 2026', time: '10:15 AM', storeIds: [], icon: 'heart' },
  { id: 4, title: 'Your November learning, all in one place', body: 'This month’s product refresh sessions are now on the break room calendar. Each session is just 20 minutes, with plenty of time for questions. Join one that works for your shift.', category: 'Learning & growth', important: false, author: 'Jordan Lee', authorRole: 'Store manager', date: 'Nov 2, 2026', time: '11:00 AM', storeIds: ['downtown'], icon: 'book' },
  ...stores.slice(1).map((store, i) => ({ id: i + 5, title: `${store.name}: getting ready for the holiday rush`, body: 'Our updated floor plan and stockroom safety guide are ready for the holiday season. Please review the notice in the break room before your next shift. Your shift lead can help with any questions.', category: 'Safety & operations', important: true, author: managers[i + 1], authorRole: 'Store manager', date: 'Nov 4, 2026', time: '8:30 AM', storeIds: [store.id], icon: 'shield' })),
];
export const visibleAnnouncements = storeId => announcements.filter(item => item.storeIds.length === 0 || item.storeIds.includes(storeId));
