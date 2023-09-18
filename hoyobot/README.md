# HoyoBot

Discord bot that interfaces with the other two application in the repo.

## Install secrets (only if you are dish)

Use `npx dotenv-vault@latest pull`

## .env Format
```
CLIENT_ID='' // Discord developer portal -> Your Application -> OAuth2 -> Client Id
BOT_SECRET='' // Discord developer portal -> You application -> Bot -> Reset Token

DEV_GUILD_ID='' // The server you want to manually test your commands on

DB_URL='' // Your own Supabase API hook - Supabase Application -> Settings -> API -> Project URL
DB_SECRET='' // Your service_role secret NOT public key - Supabase Application -> Settings -> API -> Project API keys

WEBSITE_URL='' // The URL of the hosted auth-app

// Key MHY uses for PW/USER encryption. The only one who knows the private key is MHY themselves, and I am unable to decypt them once encrypted.
HYV_PUBLIC_KEY='-----BEGIN PUBLIC KEY-----\n
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4PMS2JVMwBsOIrYWRluY\n
wEiFZL7Aphtm9z5Eu/anzJ09nB00uhW+ScrDWFECPwpQto/GlOJYCUwVM/raQpAj\n
/xvcjK5tNVzzK94mhk+j9RiQ+aWHaTXmOgurhxSp3YbwlRDvOgcq5yPiTz0+kSeK\n
ZJcGeJ95bvJ+hJ/UMP0Zx2qB5PElZmiKvfiNqVUk8A8oxLJdBB5eCpqWV6CUqDKQ\n
KSQP4sM0mZvQ1Sr4UcACVcYgYnCbTZMWhJTWkrNXqI8TMomekgny3y+d6NX/cFa6\n
6jozFIF4HCX5aW8bp8C8vq2tFvFbleQ/Q3CU56EWWKMrOcpmFtRmC18s9biZBVR/\n
8QIDAQAB\n 

-----END PUBLIC KEY-----' 
```

## Start bot
Use `npm start`