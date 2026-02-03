const strapi = require('@strapi/strapi');

async function listAdmins() {
  const app = await strapi().load();
  
  try {
    // Get all admin users
    const admins = await app.query('admin::user').findMany({
      select: ['id', 'email', 'firstname', 'lastname', 'username', 'isActive'],
      populate: { roles: { select: ['name', 'code'] } }
    });

    console.log('\n📋 Admin Users in Database:');
    console.log('━'.repeat(60));
    
    if (admins.length === 0) {
      console.log('❌ No admin users found!');
      console.log('\nYou need to create one. Go to: http://localhost:1337/admin');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.firstname} ${admin.lastname}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   👤 Username: ${admin.username || 'N/A'}`);
        console.log(`   ✅ Active: ${admin.isActive ? 'Yes' : 'No'}`);
        if (admin.roles && admin.roles.length > 0) {
          console.log(`   🔑 Roles: ${admin.roles.map(r => r.name).join(', ')}`);
        }
      });
      
      console.log('\n' + '━'.repeat(60));
      console.log('💡 Use one of these emails to login!');
      console.log('🌐 Admin URL: http://localhost:1337/admin');
    }
    
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listAdmins();
