import Research from '../models/Research.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 300 });

// 🆕 LOGIN TRENDS REPORT
export const generateLoginTrendsReport = async (req, res) => {
  try {
    const { format = 'json', range = '30', role = 'all' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(range));

    const matchQuery = {
      action: { $in: ['USER_LOGIN', 'USER_LOGOUT'] },
      timestamp: { $gte: startDate }
    };

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } }
    ];

    if (role && role !== 'all') {
      pipeline.push({ $match: { 'userDetails.role': role } });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            action: '$action',
            role: '$userDetails.role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    );

    const results = await AuditLog.aggregate(pipeline);

    if (format === 'csv') {
      const csv = [
        ['Date', 'Logins', 'Logouts', 'Student', 'Faculty', 'Admin'].join(','),
        ...Object.values(
          results.reduce((acc, item) => {
            const date = item._id.date;
            if (!acc[date]) acc[date] = { date, logins: 0, logouts: 0, student: 0, faculty: 0, admin: 0 };
            if (item._id.action === 'USER_LOGIN') {
              acc[date].logins += item.count;
              if (item._id.role) acc[date][item._id.role] += item.count;
            } else {
              acc[date].logouts += item.count;
            }
            return acc;
          }, {})
        ).map(d => [d.date, d.logins, d.logouts, d.student, d.faculty, d.admin].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="login-trends-${Date.now()}.csv"`);
      return res.send(csv);
    }

    res.json({ results, count: results.length });
  } catch (error) {
    console.error('Login trends report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// 🆕 WEEKLY SUBMISSIONS REPORT
export const generateWeeklySubmissionsReport = async (req, res) => {
  try {
    const { format = 'json', range = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(range));

    const weeklyData = await Research.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'users',
          localField: 'submittedBy',
          foreignField: '_id',
          as: 'submitter'
        }
      },
      { $unwind: '$submitter' },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' },
            status: '$status',
            role: '$submitter.role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    if (format === 'csv') {
      const weeklyMap = {};
      weeklyData.forEach(item => {
        const weekKey = `${item._id.year}-W${item._id.week}`;
        if (!weeklyMap[weekKey]) {
          weeklyMap[weekKey] = { week: weekKey, total: 0, approved: 0, pending: 0, rejected: 0, student: 0, faculty: 0 };
        }
        weeklyMap[weekKey].total += item.count;
        weeklyMap[weekKey][item._id.status] += item.count;
        if (item._id.role === 'student' || item._id.role === 'faculty') {
          weeklyMap[weekKey][item._id.role] += item.count;
        }
      });

      const csv = [
        ['Week', 'Total', 'Approved', 'Pending', 'Rejected', 'Student', 'Faculty'].join(','),
        ...Object.values(weeklyMap).map(d => 
          [d.week, d.total, d.approved, d.pending, d.rejected, d.student, d.faculty].join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-submissions-${Date.now()}.csv"`);
      return res.send(csv);
    }

    res.json({ weeklyData, count: weeklyData.length });
  } catch (error) {
    console.error('Weekly submissions report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Generate Research Report
export const generateResearchReport = async (req, res) => {
  try {
    const { status, category, startDate, endDate, format = 'json' } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const papers = await Research.find(query)
      .populate('submittedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    const summary = {
      total: papers.length,
      approved: papers.filter(p => p.status === 'approved').length,
      pending: papers.filter(p => p.status === 'pending').length,
      rejected: papers.filter(p => p.status === 'rejected').length,
      totalViews: papers.reduce((sum, p) => sum + (p.views || 0), 0),
      totalBookmarks: papers.reduce((sum, p) => sum + (p.bookmarks || 0), 0)
    };

    if (format === 'csv') {
      return exportResearchCSV(papers, res);
    }

    res.json({ papers, summary, count: papers.length });
  } catch (error) {
    console.error('Research report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Generate User Report
export const generateUserReport = async (req, res) => {
  try {
    const { role, status, startDate, endDate, format = 'json' } = req.query;
    
    let query = {};
    if (role && role !== 'all') query.role = role;
    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const users = await User.find(query)
      .select('-password -passwordHistory')
      .sort({ createdAt: -1 })
      .lean();

    const summary = {
      total: users.length,
      students: users.filter(u => u.role === 'student').length,
      faculty: users.filter(u => u.role === 'faculty').length,
      admins: users.filter(u => u.role === 'admin').length,
      approved: users.filter(u => u.isApproved).length,
      pending: users.filter(u => !u.isApproved).length
    };

    if (format === 'csv') {
      return exportUserCSV(users, res);
    }

    res.json({ users, summary, count: users.length });
  } catch (error) {
    console.error('User report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Generate Activity Report
export const generateActivityReport = async (req, res) => {
  try {
    const { action, startDate, endDate, format = 'json' } = req.query;
    
    let query = {};
    if (action && action !== 'all') query.action = { $regex: action, $options: 'i' };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .limit(1000)
      .lean();

    const summary = {
      total: logs.length,
      byAction: {}
    };

    logs.forEach(log => {
      const action = log.action || 'UNKNOWN';
      summary.byAction[action] = (summary.byAction[action] || 0) + 1;
    });

    if (format === 'csv') {
      return exportActivityCSV(logs, res);
    }

    res.json({ logs, summary, count: logs.length });
  } catch (error) {
    console.error('Activity report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Generate PDF Report
export const generatePDFReport = async (req, res) => {
  try {
    const { reportType, filters = {} } = req.body;
    
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('NUEVA ECIJA UNIVERSITY OF SCIENCE & TECHNOLOGY', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('College of Nursing - Research Repository', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).font('Helvetica-Bold').text(`${reportType.toUpperCase()} REPORT`, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    if (reportType === 'research') {
      await generateResearchPDF(doc, filters);
    } else if (reportType === 'users') {
      await generateUserPDF(doc, filters);
    } else if (reportType === 'activity') {
      await generateActivityPDF(doc, filters);
    } else if (reportType === 'comprehensive') {
      await generateComprehensivePDF(doc, filters);
    }

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'PDF generation failed' });
    }
  }
};

// 🆕 COMPREHENSIVE PDF REPORT
async function generateComprehensivePDF(doc, filters) {
  const [users, papers, logs] = await Promise.all([
    User.countDocuments(),
    Research.countDocuments({ status: 'approved' }),
    AuditLog.countDocuments()
  ]);

  doc.fontSize(14).font('Helvetica-Bold').text('COMPREHENSIVE ANALYTICS DASHBOARD', { underline: true });
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').text('SYSTEM OVERVIEW');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total Users: ${users}`);
  doc.text(`Total Approved Papers: ${papers}`);
  doc.text(`Total Activity Logs: ${logs}`);
  doc.moveDown(2);

  doc.fontSize(12).font('Helvetica-Bold').text('REPORT GENERATED');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Date: ${new Date().toLocaleString()}`);
  doc.text(`Filters Applied: ${JSON.stringify(filters)}`);
}

// Helper: Generate Research PDF
async function generateResearchPDF(doc, filters) {
let query = {};
if (filters.status && filters.status !== 'all') query.status = filters.status;
if (filters.category && filters.category !== 'all') query.category = filters.category;
const papers = await Research.find(query)
.populate('submittedBy', 'firstName lastName')
.sort({ createdAt: -1 })
.limit(100)
.lean();
// Summary
doc.fontSize(14).font('Helvetica-Bold').text('SUMMARY', { underline: true });
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica');
doc.text(`Total Papers: ${papers.length}`);
doc.text(`Approved: ${papers.filter(p => p.status === 'approved').length}`);
doc.text(`Pending: ${papers.filter(p => p.status === 'pending').length}`);
doc.text(`Rejected: ${papers.filter(p => p.status === 'rejected').length}`);

doc.moveDown(2);
// Generate Chart
const chartConfig = {
type: 'bar',
data: {
labels: ['Approved', 'Pending', 'Rejected'],
datasets: [{
label: 'Research Papers',
data: [
papers.filter(p => p.status === 'approved').length,
papers.filter(p => p.status === 'pending').length,
papers.filter(p => p.status === 'rejected').length
],
backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
}]
},
options: { plugins: { legend: { display: false }}}
};
const chartImage = await chartJSNodeCanvas.renderToBuffer(chartConfig);
doc.image(chartImage, { fit: [500, 200], align: 'center' });
doc.moveDown(2);
// Papers List
doc.fontSize(14).font('Helvetica-Bold').text('DETAILED LIST', { underline: true });
doc.moveDown(1);
papers.forEach((paper, idx) => {
if (doc.y > 700) doc.addPage();
doc.fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. ${paper.title}`, { width: 500 });
doc.fontSize(9).font('Helvetica');
doc.text(`Authors: ${paper.authors.join(', ')}`, { indent: 20 });
doc.text(`Category: ${paper.category} | Year: ${paper.yearCompleted || 'N/A'}`, { indent: 20 });
doc.text(`Status: ${paper.status.toUpperCase()} | Views: ${paper.views || 0}`, { indent: 20 });
doc.text(`Submitted by: ${paper.submittedBy?.firstName} ${paper.submittedBy?.lastName}`, { indent: 20 });
doc.moveDown(0.5); });
// Footer
doc.fontSize(8).text(
  `Report generated on ${new Date().toLocaleString()}`,
  50,
  doc.page.height - 50,
  { align: 'center' }
);

}
// Helper: Generate User PDF
async function generateUserPDF(doc, filters) {
let query = {};
if (filters.role && filters.role !== 'all') query.role = filters.role;
const users = await User.find(query)
.select('firstName lastName email studentId role isApproved createdAt')
.sort({ createdAt: -1 })
.limit(100)
.lean();
doc.fontSize(14).font('Helvetica-Bold').text('SUMMARY', { underline: true });
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica');
doc.text(`Total Users: ${users.length}`);
doc.text(`Students: ${users.filter(u => u.role === 'student').length}`);
doc.text(`Faculty: ${users.filter(u => u.role === 'faculty').length}`);
doc.text(`Admins: ${users.filter(u => u.role === 'admin').length}`);
doc.moveDown(2);
// Chart
const chartConfig = {
type: 'pie',
data: {
labels: ['Students', 'Faculty', 'Admins'],
datasets: [{
data: [
users.filter(u => u.role === 'student').length,
users.filter(u => u.role === 'faculty').length,
users.filter(u => u.role === 'admin').length
],
backgroundColor: ['#3b82f6', '#10b981', '#ef4444']
}]
}
};
const chartImage = await chartJSNodeCanvas.renderToBuffer(chartConfig);
doc.image(chartImage, { fit: [400, 200], align: 'center' });
doc.moveDown(2);
doc.fontSize(14).font('Helvetica-Bold').text('USER LIST', { underline: true });
doc.moveDown(1);
users.forEach((user, idx) => {
if (doc.y > 700) doc.addPage();
doc.fontSize(10).font('Helvetica-Bold').text(`${idx + 1}. ${user.firstName} ${user.lastName}`);
doc.fontSize(9).font('Helvetica');
doc.text(`Email: ${user.email}`, { indent: 20 });
doc.text(`ID: ${user.studentId} | Role: ${user.role}`, { indent: 20 });
doc.text(`Status: ${user.isApproved ? 'APPROVED' : 'PENDING'}`, { indent: 20 });
doc.moveDown(0.5);});
}
// Helper: Generate Activity PDF
async function generateActivityPDF(doc, filters) {
const logs = await AuditLog.find(filters)
.populate('user', 'firstName lastName email')
.sort({ timestamp: -1 })
.limit(100)
.lean();
doc.fontSize(14).font('Helvetica-Bold').text('ACTIVITY SUMMARY', { underline: true });
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica').text(`Total Activities: ${logs.length}`);
doc.moveDown(2);
logs.forEach((log, idx) => {
if (doc.y > 700) doc.addPage();
doc.fontSize(10).font('Helvetica-Bold').text(`${idx + 1}. ${log.action}`);
doc.fontSize(9).font('Helvetica');
doc.text(`User: ${log.user?.firstName} ${log.user?.lastName}`, { indent: 20 });
doc.text(`Date: ${new Date(log.timestamp).toLocaleString()}`, { indent: 20 });
doc.moveDown(0.5);
});
}
// CSV Exports
function exportResearchCSV(papers, res) {
const csv = [
['Title', 'Authors', 'Category', 'Year', 'Status', 'Views', 'Submitted By'].join(','),
...papers.map(p => [
"${p.title}",
"${p.authors.join('; ')}",
p.category,
p.yearCompleted || 'N/A',
p.status,
p.views || 0,
"${p.submittedBy?.firstName} ${p.submittedBy?.lastName}"
].join(','))
].join('\n');
res.setHeader('Content-Type', 'text/csv');
res.setHeader(
  'Content-Disposition',
  `attachment; filename="research-report-${Date.now()}.csv"`
);

res.send(csv);
}
function exportUserCSV(users, res) {
const csv = [
['Name', 'Email', 'ID', 'Role', 'Status', 'Registration Date'].join(','),
...users.map(u => [
"${u.firstName} ${u.lastName}",
u.email,
u.studentId,
u.role,
u.isApproved ? 'APPROVED' : 'PENDING',
new Date(u.createdAt).toLocaleDateString()
].join(','))
].join('\n');
res.setHeader('Content-Type', 'text/csv');
res.setHeader(
  'Content-Disposition',
  `attachment; filename="users-report-${Date.now()}.csv"`
);

res.send(csv);
}
function exportActivityCSV(logs, res) {
const csv = [
['Action', 'User', 'Email', 'Date', 'IP'].join(','),
...logs.map(l => [
l.action,
"${l.user?.firstName} ${l.user?.lastName}",
l.user?.email || 'N/A',
new Date(l.timestamp).toLocaleString(),
l.ipAddress || 'N/A'
].join(','))
].join('\n');
res.setHeader('Content-Type', 'text/csv');
res.setHeader(
  'Content-Disposition',
  `attachment; filename="activity-report-${Date.now()}.csv"`
);

res.send(csv);
}