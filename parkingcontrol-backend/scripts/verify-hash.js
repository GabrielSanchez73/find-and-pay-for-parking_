const bcrypt = require('bcryptjs');
const hash = '$2a$12$x.RV2O1Ze6xwCwqwaduQWeomhvTl4eB6Xy3l3W2DcFTL2FwVv/oea';
bcrypt.compare('parking123', hash).then((ok) => {
  console.log('parking123 valido:', ok);
  process.exit(ok ? 0 : 1);
});
