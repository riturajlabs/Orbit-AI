import dotenv from 'dotenv';

dotenv.config();

const { default: app } = await import('./app.js');
const { default: connectDB } = await import('./config/db.js');


const PORT = process.env.PORT || 5000;


connectDB()
.then(()=>{

  app.listen(PORT,()=>{

    console.log(
      `[Server] running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`,
    );

  });

})
.catch((err)=>{

  console.error(
    '[Server] Failed to connect MongoDB',
    err,
  );

  process.exit(1);

});