import { DefaultFacility, isCustomClass, PlumierApplication } from "@plumier/core"
import Mongoose from "mongoose"
import { Result, VisitorInvocation } from "typedconverter"

import { MongooseFacilityOption } from "./types"
import { printAnalysis } from './analyzer'
import { getAnalysis } from './generator'


function safeToString(obj:any){
    try{
        return obj.toString()
    }
    catch {
        return ""
    }
}

function relationToObjectIdVisitor(i: VisitorInvocation): Result {
    const id = safeToString(i.value)
    if (Mongoose.isValidObjectId(id) && isCustomClass(i.type)){
        return Result.create(Mongoose.Types.ObjectId(id))
    }
    else
        return i.proceed()
}

export class MongooseFacility extends DefaultFacility {
    option: MongooseFacilityOption
    constructor(opts?: MongooseFacilityOption) {
        super()
        this.option = { ...opts }
    }

    async initialize(app: Readonly<PlumierApplication>) {
        if(app.config.mode === "debug")
            printAnalysis(getAnalysis())
        app.set({ typeConverterVisitors: [relationToObjectIdVisitor] })
        const uri = this.option.uri ?? process.env.PLUM_MONGODB_URI
        if (uri)
            await Mongoose.connect(uri, { useNewUrlParser: true })
    }
}