import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Service } from '../../providers/service/service';
import { Post } from '../post/post';

@Component({
    templateUrl: 'blog.html'
})
export class Blog {
    posts: any;
    page: any = 1;
    hasMoreStories: boolean = true;
    date: any;
    tag: any;
    constructor(public nav: NavController, public service: Service, params: NavParams) {
        this.tag = params.data;
        this.service.getRecentPosts(this.page, this.tag).then((results) => this.handlePosts(results));
    }
    handlePosts(results) {
        console.log(results.error);
        if (results.error) {
            this.posts = {};
            this.posts.posts = [];
        } else if (results.posts != undefined) {
            for (var i = 0; i < results.posts.length; i++) {
                results.posts[i].newdate = results.posts[i].date.replace(/ /g, "T");
            }
            this.posts = results;
        }
    }
    doInfinite(infiniteScroll) {
        this.page += 1;
        this.service.getRecentPosts(this.page, this.tag).then((results: any) => {
            if (results.posts != undefined) {
                for (var i = 0; i < results.posts.posts.length; i++) {
                    results.posts[i].newdate = results.posts[i].date.replace(/ /g, "T");
                }
                for (i = 0; i < results.posts.length; i++) {
                    this.posts.posts.push(results.posts[i]);
                };
            }
            if (results.posts.length == 0) {
                this.hasMoreStories = false;
            }
            infiniteScroll.complete();
        });
    }
    goBack() {
        this.nav.pop();
    }
    goToPostDetail(post) {
        if (this.tag == 'blog') this.nav.push(Post, post);
    }
}