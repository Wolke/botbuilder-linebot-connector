//=============================================================================
//
// INTERFACES
//
//=============================================================================

/**
 * An event received from or being sent to a source.
 */
export interface IEvent {
    /** Defines type of event. Should be 'message' for an IMessage. */
    type: string;

    /** SDK thats processing the event. Will always be 'botbuilder'. */
    agent: string;

    /** The original source of the event (i.e. 'facebook', 'skype', 'slack', etc.) */
    source: string;

    /** The original event in the sources native schema. For outgoing messages can be used to pass source specific event data like custom attachments. */
    sourceEvent: any;

    /** Address routing information for the event. Save this field to external storage somewhere to later compose a proactive message to the user. */
    address: IAddress; 

    /** 
     * For incoming messages this is the user that sent the message. By default this is a copy of [address.user](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iaddress.html#user) but you can configure your bot with a 
     * [lookupUser](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iuniversalbotsettings.html#lookupuser) function that lets map the incoming user to an internal user id.
     */
    user: IIdentity;
}

/** 
 * A chat message sent between a User and a Bot. Messages from the bot to the user come in two flavors: 
 * 
 * * __reactive messages__ are messages sent from the Bot to the User as a reply to an incoming message from the user. 
 * * __proactive messages__ are messages sent from the Bot to the User in response to some external event like an alarm triggering.
 * 
 * In the reactive case the you should copy the [address](#address) field from the incoming message to the outgoing message (if you use the [Message]( /en-us/node/builder/chat-reference/classes/_botbuilder_d_.message.html) builder class and initialize it with the 
 * [session](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html) this will happen automatically) and then set the [text](#text) or [attachments](#attachments).  For proactive messages you’ll need save the [address](#address) from the incoming message to 
 * an external storage somewhere. You can then later pass this in to [UniversalBot.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot.html#begindialog) or copy it to an outgoing message passed to 
 * [UniversalBot.send()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot.html#send). 
 *
 * Composing a message to the user using the incoming address object will by default send a reply to the user in the context of the current conversation. Some channels allow for the starting of new conversations with the user. To start a new proactive conversation with the user simply delete 
 * the [conversation](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iaddress.html#conversation) field from the address object before composing the outgoing message.
 */
export interface IMessage extends IEvent {
    /** Timestamp of message given by chat service for incoming messages. */
    timestamp: string;

    /** Text to be displayed by as fall-back and as short description of the message content in e.g. list of recent conversations. */  
    summary: string; 

    /** Message text. */
    text: string;

    /** Identified language of the message text if known. */   
    textLocale: string;

    /** For incoming messages contains attachments like images sent from the user. For outgoing messages contains objects like cards or images to send to the user.   */
    attachments: IAttachment[]; 

    /** Structured objects passed to the bot or user. */
    entities: any[];

    /** Format of text fields. The default value is 'markdown'. */
    textFormat: string;

    /** Hint for how clients should layout multiple attachments. The default value is 'list'. */ 
    attachmentLayout: string; 
}

/** Represents a user, bot, or conversation. */
export interface IIdentity {
    /** Channel specific ID for this identity. */
    id: string;

    /** Friendly name for this identity. */ 
    name?: string;

    /** If true the identity is a group. Typically only found on conversation identities. */ 
    isGroup?: boolean;   
}

/** 
 * Address routing information for a [message](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.imessage.html#address). 
 * Addresses are bidirectional meaning they can be used to address both incoming and outgoing messages. They're also connector specific meaning that
 * [connectors](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iconnector.html) are free to add their own fields.
 */
export interface IAddress {
    /** Unique identifier for channel. */
    channelId: string;

    /** User that sent or should receive the message. */
    user: IIdentity;

    /** Bot that either received or is sending the message. */ 
    bot: IIdentity;

    /** 
     * Represents the current conversation and tracks where replies should be routed to. 
     * Can be deleted to start a new conversation with a [user](#user) on channels that support new conversations.
     */ 
    conversation?: IIdentity;  
}

/** Chat connector specific address. */
export interface IChatConnectorAddress extends IAddress {
    /** Incoming Message ID. */
    id?: string;

    /** Specifies the URL to post messages back. */ 
    serviceUrl?: string; 
}

/**  
 * Many messaging channels provide the ability to attach richer objects. Bot Builder lets you express these attachments in a cross channel way and [connectors](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iconnector.html) will do their best to render the 
 * attachments using the channels native constructs. If you desire more control over the channels rendering of a message you can use [IEvent.sourceEvent](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ievent.html#sourceevent) to provide attachments using 
 * the channels native schema. The types of attachments that can be sent varies by channel but these are the basic types:
 * 
 * * __Media and Files:__  Basic files can be sent by setting [contentType](#contenttype) to the MIME type of the file and then passing a link to the file in [contentUrl](#contenturl).
 * * __Cards and Keyboards:__  A rich set of visual cards and custom keyboards can by setting [contentType](#contenttype) to the cards type and then passing the JSON for the card in [content](#content). If you use one of the rich card builder classes like
 * [HeroCard](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.herocard.html) the attachment will automatically filled in for you.    
 */
export interface IAttachment {
    /** MIME type string which describes type of attachment. */
    contentType: string;

    /** (Optional) object structure of attachment. */  
    content?: any;

    /** (Optional) reference to location of attachment content. */  
    contentUrl?: string; 
}

/** Context object passed to IBotStorage calls. */
export interface IBotStorageContext {
    /** (Optional) ID of the user being persisted. If missing __userData__ won't be persisted.  */
    userId?: string;

    /** (Optional) ID of the conversation being persisted. If missing __conversationData__ and __privateConversationData__ won't be persisted. */
    conversationId?: string;

    /** (Optional) Address of the message received by the bot. */
    address?: IAddress;

    /** If true IBotStorage should persist __userData__. */
    persistUserData: boolean;

    /** If true IBotStorage should persist __conversationData__.  */
    persistConversationData: boolean;
}

/** Data values persisted to IBotStorage. */
export interface IBotStorageData {
    /** The bots data about a user. This data is global across all of the users conversations. */
    userData?: any;

    /** The bots shared data for a conversation. This data is visible to every user within the conversation.  */
    conversationData?: any;

    /** 
     * The bots private data for a conversation.  This data is only visible to the given user within the conversation. 
     * The session stores its session state using privateConversationData so it should always be persisted. 
     */
    privateConversationData?: any;
}

/** Replacable storage system used by UniversalBot. */
export interface IBotStorage {
    /** Reads in data from storage. */
    getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void): void;
    
    /** Writes out data to storage. */
    saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void): void;
}

/** Options used to initialize a BotServiceConnector instance. */
export interface IBotServiceConnectorSettings {
    /** The bots App ID assigned in the Bot Framework portal. */
    appId?: string;

    /** The bots App Password assigned in the Bot Framework Portal. */
    appPassword?: string;

    /** If true the bots userData, privateConversationData, and conversationData will be gzipped prior to writing to storage. */
    gzipData?: boolean;    
}

/** Options used to initialize a TableBotStorage instance. */
export interface IAzureBotStorageOptions {
    /** If true the data will be gzipped prior to writing to storage. */
    gzipData?: boolean;   
}

export interface IStorageClient {
    /** Initializes the Azure Table client */
    initialize(callback: (error: any) => void): void;

    /** Inserts or replaces an entity in the table */
    insertOrReplace(partitionKey: string, rowKey: string, data: any, isCompressed: boolean, callback: (error: any, etag: any, response: IHttpResponse) => void): void;

    /** Retrieves an entity from the table */
    retrieve(partitionKey: string, rowKey: string, callback: (error: any, entity: IBotEntity, response: IHttpResponse) => void): void;
}

/**
 * Entity that holds bot data
 */
export interface IBotEntity {
    data: string;
    isCompressed: boolean;
}

export interface IAzureTableClient {
    
    /** Initializes the Azure Table client */
    initialize(callback: (error: Error) => void): void;

    /** Inserts or replaces an entity in the table */
    insertOrReplace(partitionKey: string, rowKey: string, data: any, isCompressed: boolean, callback: (error: Error, etag: any, response: IHttpResponse) => void): void;

    /** Retrieves an entity from the table */
    retrieve(partitionKey: string, rowKey: string, callback: (error: Error, entity: IBotEntity, response: IHttpResponse) => void): void;
}

export interface IStorageClient {
    /** Initializes the storage client */
    initialize(callback: (error: any) => void): void;

    /** Inserts or replaces an entity in the store */
    insertOrReplace(partitionKey: string, rowKey: string, data: any, isCompressed: boolean, callback: (error: any, etag: any, response: IHttpResponse) => void): void;

    /** Retrieves an entity from the store */
    retrieve(partitionKey: string, rowKey: string, callback: (error: any, entity: IBotEntity, response: IHttpResponse) => void): void;
}

export interface IDocumentDbOptions {
    /** DocumentDb host */
    host: string;

    /** DocumentDb masterKey */
    masterKey: string;

    /** DocumentDb database name */
    database: string;

    /** DocumentDb collection name */
    collection: string;
}

export interface IHttpResponse {
    
    /** Whether the Http request was successful */
    isSuccessful: boolean;
    
    /** Http status code */
    statusCode: string;   
}

export interface IStorageError {

    /** Error code from Azure Table */
    code: string;

    /** Error message from Azure Table */
    message: string;

    /** Status code from Azure Table */
    statusCode: string;
}

export class FaultyAzureTableClient implements IAzureTableClient {

    /** 
     * Creates a new instance of the FaultyAzureTableClient, a rudimentary fault injection implementation of IAzureTableClient
     * @param underlying table client to be used on calls that should not fault 
     * @param specification of when and with what error faults should be injected 
     */
    constructor(client: IAzureTableClient, faultSettings: IFaultSettings);

    /** Initializes the azure table client */
    initialize(callback: (error: Error) => void): void;

    /** Inserts or replaces an entity in the table */
    insertOrReplace(partitionKey: string, rowKey: string, data: any, isCompressed: boolean, callback: (error: Error, etag: any, response: IHttpResponse) => void): void;

    /** Retrieves an entity from the table */
    retrieve(partitionKey: string, rowKey: string, callback: (error: Error, entity: IBotEntity, response: IHttpResponse) => void): void;
}

export interface IFaultSettings {

    /** Whether calls to insertOrReplace should fail */
    shouldFailInsert: boolean;

    /** Whether calls to initialize should fail */
    shouldFailInitialize: boolean;

    /** Whether calls to retrieve should fail */
    shouldFailRetrieve: boolean;

    /** The error that should be reported when failures occur */
    error: IStorageError;

    /** The Http response that should be reported when failures occur */
    response: IHttpResponse;
}

//=============================================================================
//
// CLASSES
//
//=============================================================================

/** Connects a UniversalBot to multiple channels via the Bot Framework. */
export class BotServiceConnector implements IBotStorage {

    /** 
     * Creates a new instnace of the BotServiceConnector.
     * @param settings (Optional) config params that let you specify the bots App ID & Password you were assigned in the Bot Frameworks developer portal. 
     */
    constructor(settings?: IBotServiceConnectorSettings);

    /** Registers an Express or Restify style hook to listen for new messages. */
    listen(): (req: any, res: any) => void;

    /** Called by the UniversalBot at registration time to register a handler for receiving incoming events from a channel. */
    onEvent(handler: (events: IEvent[], callback?: (err: Error) => void) => void): void;
    
    /** Called by the UniversalBot to deliver outgoing messages to a user. */
    send(messages: IMessage[], done: (err: Error) => void): void;

    /** Called when a UniversalBot wants to start a new proactive conversation with a user. The connector should return a properly formated __address__ object with a populated __conversation__ field. */
    startConversation(address: IAddress, done: (err: Error, address?: IAddress) => void): void;

    /** Reads in data from the Bot Frameworks state service. */
    getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void): void;

    /** Writes out data to the Bot Frameworks state service. */
    saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void): void;
}


/** Azure Storage based implementation of IBotStorage. */
export class AzureBotStorage implements IBotStorage {

    /** 
     * Creates a new instance of the AzureBotStorage.
     * @param options config params that let you specify storage preferences 
     * @param optional storage client to be used. If not specified here, the client() method must be called before usage to configure a table client
     */
    constructor(options: IAzureBotStorageOptions, storageClient?: IStorageClient);
    
    /** Configures the storage client to use for bot state */
    client(storageClient: IStorageClient) : this;

    /** Reads in data from the table. */
    getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void): void;

    /** Writes out data to the table. */
    saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void): void;
}

export class AzureTableClient implements IAzureTableClient {

    /** 
     * Creates a new instance of the AzureTableClient.
     * @param name of the table to be used in Azure Table 
     * @param optional Azure storage account name. If not specified, development storage is used and Azure Storage Emulator should be started
     * @param optional Azure storage account key. If not specified, development storage is used and Azure Storage Emulator should be started 
     */
    constructor(tableName: string, accountName?: string, accountKey?: string);

    /** Initializes the azure table client */
    initialize(callback: (error: Error) => void): void;

    /** Inserts or replaces an entity in the table */
    insertOrReplace(partitionKey: string, rowKey: string, data: any, isCompressed: boolean, callback: (error: Error, etag: any, response: IHttpResponse) => void): void;

    /** Retrieves an entity from the table */
    retrieve(partitionKey: string, rowKey: string, callback: (error: Error, entity: IBotEntity, response: IHttpResponse) => void): void;
}

export class DocumentDbClient implements IStorageClient {

    constructor(options: IDocumentDbOptions);

    /** Initializes the DocumentDb client */
    initialize(callback: (error: Error) => void): void;

    /** Inserts or replaces an entity in the DocumentDb */
    insertOrReplace(partitionKey: string, rowKey: string, data: any, isCompressed: boolean, callback: (error: Error, etag: any, response: IHttpResponse) => void): void;

    /** Retrieves an entity from the DocumentDb */
    retrieve(partitionKey: string, rowKey: string, callback: (error: Error, entity: IBotEntity, response: IHttpResponse) => void): void;
}

