import express from "express";
import {Context} from "../server";
import mime from "mime";

export default (ctx:Context) => {
    const {app, dbc} = ctx;

    app.get("/posts/:id", async (req, res, next) => {
        const post = await dbc.getPost(req.params.id);
        if (!post) return res.render("404");

        let fpost: any = {
            title: post.title,
            created: post.created,
            author: {},
            comments: [],
            body: post.body,
            attachment: post.attachment,
            amime: mime.getType(post.attachment),
            id: post.id,
        };

        let user = await dbc.getById("users", post.author);
        fpost.author = {
            username: user.username,
            id: user.id,
            avatar: user.avatar
        };

        let comments: any[] = [];
        for (let i in post.comments) {
            let id = post.comments[i];

            let comment = await dbc.getById("comments", id);
            let fcomment = {
                author: {},
                created: comment.created,
                body: comment.body
            }

            let cuser = await dbc.getById("users", comment.author);
            fcomment.author = {
                username: cuser.username,
                id: cuser.id,
                avatar: cuser.avatar
            }

            comments.push(fcomment);
        }
        fpost.comments = comments;

        res.locals.fpost = fpost;
        res.render("post");
    });

    app.get("/users/:id", async (req, res, next) => {
        const user = await dbc.getById("users", req.params.id);
        if (!user) return next();

        let fuser = {
            created: user.created,
            username: user.username,
            about: user.about || "(no bio)",
            avatar: user.avatar
        };

        res.locals.fuser = fuser;
        res.render("user");
    });

}