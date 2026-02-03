const strapi = require('@strapi/strapi');

async function createAdmin() {
  const app = await strapi().load();
  
  const adminEmail = 'admin@b4us.com';
  const adminPassword = 'Admin123!';
  const adminUsername = 'admin';
  const adminFirstname = 'Admin';
  const adminLastname = 'B4US';

  try {
    // Check if admin already exists
    const existingAdmin = await app.admin.services.user.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminEmail);
      console.log('Updating password...');
      
      // Update password
      await app.admin.services.user.updateById(existingAdmin.id, {
        password: adminPassword
      });
      
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin
      const admin = await app.admin.services.user.create({
        email: adminEmail,
        username: adminUsername,
        firstname: adminFirstname,
        lastname: adminLastname,
        password: adminPassword,
        isActive: true,
        roles: []
      });

      // Assign super admin role
      const superAdminRole = await app.admin.services.role.getSuperAdmin();
      await app.admin.services.user.updateById(admin.id, {
        roles: [superAdminRole.id]
      });

      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🌐 Admin URL: http://localhost:1337/admin\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
