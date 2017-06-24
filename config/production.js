module.exports = {
	log: "debug",
	ws: {
		url: 'ws://localhost:8090/'
	},
	http:{
		url: 'http://localhost:8090/'
	},
	db: {
    	provider: "mongodb"
    	connection: "mongodb://localhost:27017/mc_dev",
    	commentsCollection: 'comments',
    	workItemsCollection: 'work_items',
    	containersCollection: 'containers',
      slackuserCollection: 'slack_user_list_aakashbot'
  	},
  	bot: {
    appId:'03733acc-90f3-4f6d-9647-ff221fbdcb33',
    appPass: 'bjpiZCJECNRM8Cbaj50DYsQ'
  },
	psqldb: {
		database: 'manny'
  	}
};
