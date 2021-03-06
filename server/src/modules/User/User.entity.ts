import {
  Entity,
  Column,
  BaseEntity,
  BeforeInsert,
  OneToMany,
  PrimaryColumn,
  BeforeUpdate
} from "typeorm";
import { hashSync, compareSync } from "bcrypt-nodejs";
import { IsNotEmpty, IsEmail, MinLength } from "class-validator";
import * as jwt from "jsonwebtoken";
import uuidv4 from "uuid/v4";

import constants from "../../config/constants";
import LikePost from "../LikePost/LikePost.entity";
import CommentPost from "../CommentPost/CommentPost.entity";
import Post from "../Post/Post.entity";
import FriendRequest from "../FriendRequest/FriendReques.entity";
import { Unique } from "../../utils/uniqueUser.validate";

@Entity()
export default class User extends BaseEntity {
  @PrimaryColumn("uuid") id: string;

  @IsEmail()
  @IsNotEmpty()
  @Unique({
    message: "$value already exists. Choose another email."
  })
  @Column({
    type: "varchar",
    length: "200"
  })
  email: string;

  @IsNotEmpty()
  @Column({ type: "varchar", length: "230" })
  firstName: string;

  @IsNotEmpty()
  @Column({ type: "varchar", length: "230" })
  lastName: string;

  @IsNotEmpty()
  @MinLength(5)
  @Column({ type: "text" })
  password: string;

  @Column({ type: "varchar", length: "250" })
  nickName: string;

  @IsNotEmpty()
  @Column({ type: "varchar", length: "250" })
  gender: string;

  @IsNotEmpty()
  @Column({ type: "date" })
  birthDate: Date;

  @Column({ type: "text" })
  profilePicture: string;

  @Column({ type: "varchar", length: "250" })
  hometown: string;

  @Column({ type: "varchar", length: "50" })
  relationship: string;

  @Column({ type: "text" })
  aboutMe: string;

  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  @OneToMany(_ => FriendRequest, friendrequest => friendrequest.sender)
  requestsSent: FriendRequest[];

  @OneToMany(_ => FriendRequest, friendrequest => friendrequest.receiver)
  requestsReceived: FriendRequest[];

  @OneToMany(() => LikePost, like => like.user)
  likePost: LikePost;

  @OneToMany(() => CommentPost, commentPost => commentPost.user)
  commentPost: CommentPost;

  @BeforeInsert()
  hashPassword() {
    this.password = hashSync(this.password);
  }

  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }

  @BeforeInsert()
  addPhoto() {
    if (!this.profilePicture) {
      if (this.gender === "male") {
        this.profilePicture = "./public/man.png";
      } else {
        this.profilePicture = "./public/woman.png";
      }
    }
  }

  @BeforeUpdate()
  @BeforeInsert()
  setNickname() {
    if (!this.nickName) {
      this.nickName = `${this.firstName} ${this.lastName}`;
    }
  }

  createToken() {
    return jwt.sign({ id: this.id }, constants.JWT_SECRET);
  }

  authanticateUser(password) {
    return compareSync(password, this.password);
  }
}
