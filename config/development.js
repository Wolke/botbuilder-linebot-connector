module.exports = {
	log: "debug",
	ws: {
		url: 'ws://127.0.0.1:8090/'
	},
	http:{
		url: 'http://127.0.0.1:8090/'
	},
	db: {
    	provider: "mongodb",
    	connection: "mongodb://localhost:27017/mc_prod",
    	commentsCollection: 'comments',
    	workItemsCollection: 'work_items',
    	containersCollection: 'containers'
  	},
	psqldb: {
		database: 'manny_dev'
  	}
};


//    	connection: "mongodb://localhost:27017/mc_prod",


/*module.exports = {
	log: "debug",
	ws: {
		url: 'ws://127.0.0.1:8090/'
	},
	http:{
		url: 'http://127.0.0.1:8090/'
	},
	db: {
    	provider: "mongodb",
    	connection: "mongodb://52.178.27.219:27017/mc_prod",
    	commentsCollection: 'comments',
    	workItemsCollection: 'work_items',
    	containersCollection: 'containers'
  	},
	psqldb: {
		database: 'manny_dev'
  	}
};*/
