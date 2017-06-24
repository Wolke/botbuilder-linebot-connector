module.exports = {
  greetings: ['Hey ','Hello ','Hi '],
  pleasantries: ['I am good, thank you.','Never been better, shall we get started?', 'As bright as the sun, How can I help you?'],
  defaultreplies: ["I'm sorry I didn't understand."],
  intermediatereps: ["I am working on it, can you give me a moment mcname.","Sure thing, mcname"],
  cookie: {
    secret: process.env.COOKIE_SECRET_KEY,
  },
  session: {
    secure: true
  },
  db: {
    provider: "mongodb",//52.178.27.219
    connection: "mongodb://localhost:27017/mc_prod",
    commentsCollection: 'comments',
    workItemsCollection: 'work_items',
    containersCollection: 'containers',
    slackuserCollection: 'slack_user_list_aakashbot',
    conversationalCollection:"cc_data"
  },
  sqldb: {
  	provider: "mysql",
  	host: "52.178.27.219"
  },
  psqldb: {
    provider: "pgsql",
    host: "13.94.158.194",
    user: 'manny',
    database: 'manny', 
    password: '', 
    port: 5432, 
    max: 20,
    idleTimeoutMillis: 30000,
  },
  ws: {
    url: process.env.WS_URL
  },
  events: {
    create_folder:1,
    create_witem:2,
    edit_folder:3,
    edit_witem:4,
    delete_folder:5,
    delete_witem:6,
    modify_sdate:7,
    modify_edate:8,
    change_state:9,
    reorder_folder:10,
    reorder_witem:11,
    add_member:12,
    remove_member:13,
    edit_profile:14,
    change_password:15,
    edit_folder_meta_title:16,
    edit_folder_meta_description:17,
    edit_folder_meta_pstartdate:18,
    edit_folder_meta_penddate:19,
    edit_witem_meta_title:20,
    edit_witem_meta_description:21,
    edit_witem_meta_pstartdate:22,
    edit_witem_meta_penddate:23,
    edit_witem_modify_mem_state:24,
    edit_witem_modify_witem_state:25,
    add_comment_work_item:26,
    edit_comment_work_item:27,
    delete_comment_work_item:28
  },
 bot: {
   appId:'95fffae9-a0a5-473b-add7-db4aac8b4722',
    appPass: '371YtYtSx7hvwQ1H1Fa63qM'
  },
  log: "debug"
};
