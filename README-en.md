<p align="center">
    <img src="doc/demo/logo.png" width="80px" />
    <h1 align="center">QianL Mail</h1>
    <p align="center">An enhanced Cloudflare mail service based on Cloud Mail, with search, trash, rules, labels, and privacy controls 🎉</p>
    <p align="center">
       <a href="/README.md" style="margin-left: 5px">简体中文</a> | English 
    </p>
    <p align="center">
        <a href="https://github.com/xinther/mail" target="_blank">
            <img src="https://img.shields.io/badge/QianL_Mail-v3.2.0--qianl.1-1890ff" alt="QianL Mail version" />
        </a>
        <a href="https://github.com/maillab/cloud-mail/tree/main?tab=MIT-1-ov-file" target="_blank" >
            <img src="https://img.shields.io/badge/license-MIT-green" />
        </a>    
        <a href="https://github.com/maillab/cloud-mail/releases" target="_blank" >
            <img src="https://img.shields.io/github/v/release/maillab/cloud-mail" alt="releases" />
        </a>  
        <a href="https://github.com/maillab/cloud-mail/issues" >
            <img src="https://img.shields.io/github/issues/maillab/cloud-mail" alt="issues" />
        </a>  
        <a href="https://github.com/maillab/cloud-mail/stargazers" target="_blank">
            <img src="https://img.shields.io/github/stars/maillab/cloud-mail" alt="stargazers" />
        </a>  
        <a href="https://github.com/maillab/cloud-mail/forks" target="_blank" >
            <img src="https://img.shields.io/github/forks/maillab/cloud-mail" alt="forks" />
        </a>
    </p>
    <p align="center">
        <a href="https://trendshift.io/repositories/20459" target="_blank" >
            <img src="https://trendshift.io/api/badge/repositories/20459" alt="trendshift" >
        </a>
    </p>
</p>

> QianL Mail is maintained at [xinther/mail](https://github.com/xinther/mail) and enhanced from the open-source [maillab/cloud-mail](https://github.com/maillab/cloud-mail) project. Thanks to the original author eoao for supporting open source.

## Description
With only one domain, you can create multiple different email addresses, similar to major email platforms. This project can be deployed on Cloudflare Workers to reduce server costs and build your own email service.
## Project Showcase

- [Live Demo](https://skymail.ink)<br>
- [Deployment Guide](https://doc.skymail.ink/en/)<br>


| ![](/doc/demo/demo1.png) | ![](/doc/demo/demo2.png) |
|--------------------------|--------------------------|
| ![](/doc/demo/demo3.png) | ![](/doc/demo/demo4.png) |

## Features

- **💰 Low-Cost Usage**: No server required — deploy to Cloudflare Workers to reduce costs.

- **💻 Responsive Design**: Automatically adapts to both desktop and most mobile browsers.

- **📧 Email Sending**: Integrated with Resend, supporting bulk email sending and attachments.

- **🔎 Mail Productivity**: Full-text search, retention-based trash, message recovery, personal rules, and colored labels.

- **🛡️ Admin Features**: Admin controls for user and email management with RBAC-based access control.

- **📦 Attachment Support**: Send and receive attachments, stored and downloaded via R2 object storage.

- **🔔 Email Push**: Forward received emails to Telegram bots or other email providers.

- **📡 Open API**: Supports batch user creation via API and multi-condition email queries

- **🔢 Verification Code Recognition**: Auto-detect codes via Workers AI

- **📈 Data Visualization**: Use ECharts to visualize system data, including user email growth.

- **🎨 Personalization**: Customize website title, login background, and transparency.

- **🤖 CAPTCHA**: Integrated with Turnstile CAPTCHA to prevent automated registration.

- **📜 More Features**: Under development...

## v3.2 Database Upgrade and Verification

After deploying the updated Worker, visit `https://your-project-domain/api/init/your_jwt_secret` once to upgrade the database. Initialization is idempotent. It creates the label and mail-rule tables, trash fields, and the D1 FTS5 full-text index, while logging migration results to the Worker logs.

Trash is retained for 30 days by default and can be changed in System Settings. When Sync Delete is enabled, deletion still bypasses Trash and permanently removes the message. Cloudflare D1 export does not support virtual tables, so drop `email_fts` and its triggers before exporting; after importing, visit the initialization URL again to recreate and rebuild the index.

Allow Admins to View All Mail remains enabled by default for compatibility, and signed-in users receive a privacy notice while it is enabled. Disabling it hides the All Mail entry and rejects all-mail query and deletion requests at the Worker API layer.

Development verification commands:

```bash
pnpm --dir mail-vue run build
pnpm --dir mail-worker run test
pnpm --dir mail-worker run test:worker
pnpm --dir mail-worker exec wrangler deploy --dry-run
```

## Tech Stack

- **Platform**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)

- **Web Framework**: [Hono](https://hono.dev/)

- **ORM**: [Drizzle](https://orm.drizzle.team/)

- **Frontend Framework**: [Vue3](https://vuejs.org/)

- **UI Framework**: [Element Plus](https://element-plus.org/)

- **Email Service**: [Resend](https://resend.com/)

- **Cache**: [Cloudflare KV](https://developers.cloudflare.com/kv/)

- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/)

- **File Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/)

## Project Structure

```
cloud-mail
├── mail-worker				    # Backend worker project
│   ├── src                  
│   │   ├── api	 			    # API layer
│   │   ├── const  			    # Project constants
│   │   ├── dao                 # Data access layer
│   │   ├── email			    # Email processing and handling
│   │   ├── entity			    # Database entities
│   │   ├── error			    # Custom exceptions
│   │   ├── hono			    # Web framework, middleware, error handling
│   │   ├── i18n			    # Internationalization
│   │   ├── init			    # Database and cache initialization
│   │   ├── model			    # Response data models
│   │   ├── security			# Authentication and authorization
│   │   ├── service			    # Business logic layer
│   │   ├── template			# Message templates
│   │   ├── utils			    # Utility functions
│   │   └── index.js			# Entry point
│   ├── package.json			# Project dependencies
│   └── wrangler.toml			# Project configuration
│
├─ mail-vue				        # Frontend Vue project
│   ├── src
│   │   ├── axios 			    # Axios configuration
│   │   ├── components			# Custom components
│   │   ├── echarts			    # ECharts integration
│   │   ├── i18n			    # Internationalization
│   │   ├── init			    # Startup initialization
│   │   ├── layout			    # Main layout components
│   │   ├── perm			    # Permissions and access control
│   │   ├── request			    # API request layer
│   │   ├── router			    # Router configuration
│   │   ├── store			    # Global state management
│   │   ├── utils			    # Utility functions
│   │   ├── views			    # Page components
│   │   ├── app.vue			    # Root component
│   │   ├── main.js			    # Entry JS file
│   │   └── style.css			# Global styles
│   ├── package.json			# Project dependencies
└── └── env.release				# Environment configuration

```

## Sponsor

If the enhancements are useful to you, you may voluntarily support QianL Mail:

<img width="420px" src="./mail-vue/public/qianl-donation.png" alt="QianL Mail WeChat Pay and Alipay donation QR codes">

Verify the recipient and amount before paying. The QR codes are for voluntary donations only.

You can also continue supporting the original Cloud Mail author:

<a href="https://doc.skymail.ink/support.html">
<img width="170px" src="./doc/images/support.png" alt="">
</a>

## License

This project is licensed under the [MIT](LICENSE) license. QianL Mail enhancements are © 2026 xinther; the original Cloud Mail copyright and attribution remain intact.

## Communication

[Telegram](https://t.me/cloud_mail_tg)
