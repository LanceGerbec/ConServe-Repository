// server/src/controllers/reportController.js
import AuditLog from '../models/AuditLog.js';
import Research from '../models/Research.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

const generateCSV = (headers, rows) => {
  const escape = val => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
};

const generateExcel = async (title, headers, rows) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title);
  
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a8a' } };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  rows.forEach(row => sheet.addRow(row));
  
  sheet.columns.forEach((col, i) => {
    let maxLen = headers[i].length;
    rows.forEach(row => {
      const len = String(row[i] || '').length;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 2, 50);
  });
  
  sheet.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });
  
  return await workbook.xlsx.writeBuffer();
};

const safeText = (doc, text, x, y, opts = {}) => {
  try {
    const str = String(text || '').substring(0, 200);
    doc.text(str, x, y, opts);
  } catch (e) {
    doc.text('N/A', x, y, opts);
  }
};

const generatePDF = (title, headers, rows, res) => {
  try {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}-${Date.now()}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).font('Helvetica-Bold').text('NEUST College of Nursing', { align: 'center' });
    doc.fontSize(12).text(title, { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const availableWidth = doc.page.width - 60;
    const colWidth = availableWidth / headers.length;
    let y = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => safeText(doc, h, 30 + i * colWidth, y, { width: colWidth - 5 }));
    y += 20;
    doc.moveTo(30, y).lineTo(doc.page.width - 30, y).stroke();
    y += 5;

    doc.font('Helvetica').fontSize(8);
    rows.forEach(row => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
      row.forEach((cell, i) => safeText(doc, cell, 30 + i * colWidth, y, { width: colWidth - 5, ellipsis: true }));
      y += 15;
    });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'PDF generation failed' });
    }
  }
};

export const generateUserReport = async (req, res) => {
  try {
    const { format = 'csv', role, status } = req.query;
    
    let query = { isDeleted: false, role: { $in: ['student', 'faculty'] } };
    if (role && ['student', 'faculty'].includes(role)) query.role = role;
    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;
    
    const users = await User.find(query)
      .select('firstName lastName email studentId role isApproved createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    const headers = ['Name', 'Email', 'ID', 'Role', 'Status', 'Registered'];
    const rows = users.map(u => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.studentId,
      u.role,
      u.isApproved ? 'APPROVED' : 'PENDING',
      new Date(u.createdAt).toLocaleDateString()
    ]);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="users-${Date.now()}.csv"`);
      return res.send(generateCSV(headers, rows));
    }
    
    if (format === 'excel') {
      const buffer = await generateExcel('Users', headers, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="users-${Date.now()}.xlsx"`);
      return res.send(buffer);
    }
    
    if (format === 'pdf') {
      return generatePDF('User Directory Report', headers, rows, res);
    }
    
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('User report error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
};

export const generateResearchReport = async (req, res) => {
  try {
    const { format = 'csv', status, category } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    
    const papers = await Research.find(query)
      .populate('submittedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
    
    const headers = ['Title', 'Authors', 'Category', 'Year', 'Status', 'Views', 'Submitted By', 'Date'];
    const rows = papers.map(p => [
      p.title,
      p.authors.join('; '),
      p.category,
      p.yearCompleted || 'N/A',
      p.status.toUpperCase(),
      p.views || 0,
      `${p.submittedBy?.firstName || ''} ${p.submittedBy?.lastName || ''}`.trim(),
      new Date(p.createdAt).toLocaleDateString()
    ]);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="research-${Date.now()}.csv"`);
      return res.send(generateCSV(headers, rows));
    }
    
    if (format === 'excel') {
      const buffer = await generateExcel('Research Papers', headers, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="research-${Date.now()}.xlsx"`);
      return res.send(buffer);
    }
    
    if (format === 'pdf') {
      return generatePDF('Research Papers Report', headers, rows, res);
    }
    
    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Research report error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
};

export const generateActivityReport = async (req, res) => {
  try {
    const { format = 'csv', action, startDate, endDate } = req.query;
    
    let query = {};
    if (action && action !== 'all') query.action = { $regex: action, $options: 'i' };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(5000)
      .lean();
    
    const headers = ['Action', 'User', 'Email', 'Date', 'IP Address'];
    const rows = logs.map(l => [
      l.action,
      `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim() || 'Unknown',
      l.user?.email || 'N/A',
      new Date(l.timestamp).toLocaleString(),
      l.ipAddress || 'N/A'
    ]);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="activity-${Date.now()}.csv"`);
      return res.send(generateCSV(headers, rows));
    }
    
    if (format === 'excel') {
      const buffer = await generateExcel('Activity Logs', headers, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="activity-${Date.now()}.xlsx"`);
      return res.send(buffer);
    }
    
    if (format === 'pdf') {
      return generatePDF('Activity Logs Report', headers, rows, res);
    }
    
    res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Activity report error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
};

export const generateLoginTrendsReport = async (req, res) => {
  try {
    const { format = 'csv', days = '30', role = 'all' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const matchQuery = { action: { $in: ['USER_LOGIN', 'USER_LOGOUT'] }, timestamp: { $gte: startDate } };
    const pipeline = [
      { $match: matchQuery },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDetails' } },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } }
    ];

    if (role !== 'all') pipeline.push({ $match: { 'userDetails.role': role } });

    pipeline.push(
      { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, action: '$action', role: '$userDetails.role' }, count: { $sum: 1 } } },
      { $sort: { '_id.date': 1 } }
    );

    const results = await AuditLog.aggregate(pipeline);
    const dailyMap = {};

    results.forEach(item => {
      const date = item._id.date;
      if (!dailyMap[date]) dailyMap[date] = { date, logins: 0, logouts: 0, student: 0, faculty: 0, admin: 0 };
      if (item._id.action === 'USER_LOGIN') {
        dailyMap[date].logins += item.count;
        if (item._id.role) dailyMap[date][item._id.role] += item.count;
      } else {
        dailyMap[date].logouts += item.count;
      }
    });

    const headers = ['Date', 'Logins', 'Logouts', 'Student', 'Faculty', 'Admin'];
    const rows = Object.values(dailyMap).map(d => [d.date, d.logins, d.logouts, d.student, d.faculty, d.admin]);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="login-trends-${Date.now()}.csv"`);
      return res.send(generateCSV(headers, rows));
    }

    if (format === 'excel') {
      const buffer = await generateExcel('Login Trends', headers, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="login-trends-${Date.now()}.xlsx"`);
      return res.send(buffer);
    }

    if (format === 'pdf') {
      return generatePDF('Login Activity Trends Report', headers, rows, res);
    }

    res.json({ data: rows, count: rows.length });
  } catch (error) {
    console.error('Login trends error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
};

export const generateWeeklySubmissionsReport = async (req, res) => {
  try {
    const { format = 'csv', weeks = '8' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (parseInt(weeks) * 7));

    const weeklyData = await Research.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $lookup: { from: 'users', localField: 'submittedBy', foreignField: '_id', as: 'submitter' } },
      { $unwind: '$submitter' },
      { $group: { _id: { week: { $week: '$createdAt' }, year: { $year: '$createdAt' }, status: '$status', role: '$submitter.role' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    const weeklyMap = {};
    weeklyData.forEach(item => {
      const key = `${item._id.year}-W${item._id.week}`;
      if (!weeklyMap[key]) weeklyMap[key] = { week: key, total: 0, approved: 0, pending: 0, rejected: 0, student: 0, faculty: 0 };
      weeklyMap[key].total += item.count;
      weeklyMap[key][item._id.status] += item.count;
      if (item._id.role === 'student' || item._id.role === 'faculty') weeklyMap[key][item._id.role] += item.count;
    });

    const headers = ['Week', 'Total', 'Approved', 'Pending', 'Rejected', 'Student', 'Faculty'];
    const rows = Object.values(weeklyMap).map(d => [d.week, d.total, d.approved, d.pending, d.rejected, d.student, d.faculty]);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-submissions-${Date.now()}.csv"`);
      return res.send(generateCSV(headers, rows));
    }

    if (format === 'excel') {
      const buffer = await generateExcel('Weekly Submissions', headers, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-submissions-${Date.now()}.xlsx"`);
      return res.send(buffer);
    }

    if (format === 'pdf') {
      return generatePDF('Weekly Submission Analysis Report', headers, rows, res);
    }

    res.json({ data: rows, count: rows.length });
  } catch (error) {
    console.error('Weekly submissions error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
};

export const generatePDFReport = async (req, res) => {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="comprehensive-${Date.now()}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).font('Helvetica-Bold').text('NEUST College of Nursing', { align: 'center' });
    doc.fontSize(12).text('Comprehensive Analytics Report', { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const [userCount, paperCount, logCount] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Research.countDocuments({ status: 'approved' }),
      AuditLog.countDocuments()
    ]);

    doc.fontSize(12).font('Helvetica-Bold').text('System Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Users: ${userCount}`);
    doc.text(`Approved Papers: ${paperCount}`);
    doc.text(`Activity Logs: ${logCount}`);

    doc.end();
  } catch (error) {
    console.error('PDF error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'PDF generation failed' });
  }
};