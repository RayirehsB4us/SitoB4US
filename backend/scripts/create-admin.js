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
    const existingAdmin = await app.query('admin::user').findOne({ 
      where: { email: adminEmail } 
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminEmail);
      console.log('Updating password...');
      
      // Hash password using Strapi's admin service
      const hashedPassword = await app.admin.services.auth.hashPassword(adminPassword);
      
      // Update password
      await app.query('admin::user').update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Admin password updated successfully!');
    } else {
      // Get super admin role
      const superAdminRole = await app.query('admin::role').findOne({
        where: { code: 'strapi-super-admin' }
      });

      if (!superAdminRole) {
        console.error('❌ Super admin role not found!');
        process.exit(1);
      }

      // Hash password
      const hashedPassword = await app.admin.services.auth.hashPassword(adminPassword);

      // Create new admin
      const admin = await app.query('admin::user').create({
        data: {
          email: adminEmail,
          username: adminUsername,
          firstname: adminFirstname,
          lastname: adminLastname,
          password: hashedPassword,
          isActive: true,
          roles: [superAdminRole.id]
        }
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
