import Admin from '../models/Admin.model.js';
import AdminSettings from '../models/AdminSettings.model.js';

export const seedAdminAndSettings = async () => {
  try {
    const adminEmail = 'scanqrandprint@gmail.com';
    const adminPassword = 'adminofscanandprint@2026';

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await Admin.create({ email: adminEmail, password: adminPassword });
      console.log('✅ Default Admin account created.');
    }

    const settingsCount = await AdminSettings.countDocuments();
    if (settingsCount === 0) {
      await AdminSettings.create({});
      console.log('✅ Default Admin settings created.');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};
