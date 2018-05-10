import { getManager } from "typeorm";
import FriendRequest from "./FriendReques.entity";
import User from "../User/User.entity";

export default {
  Query: {
    getMyFriends: async (_, __, ctx) => {
      try {
        /*
          Get My friend from Freind_request Table
        */
        const users = await getManager().query(
          `SELECT *
          FROM user u
          INNER JOIN 
          (
          SELECT fq.senderId as sender_id, fq.receiverId as receiver_id
          FROM friend_request AS fq
          WHERE (fq.senderId = ? OR fq.receiverId = ?) AND (fq.isAccepted = true)
          ) a ON u.id <> ? AND (u.id = a.sender_id OR u.id = a.receiver_id) 
          `,
          [ctx.user.id, ctx.user.id, ctx.user.id]
        );

        return users;
      } catch (error) {
        console.error(error);
        return;
      }
    },
    getMyFriendRequests: async (_, __, ctx) => {
      try {
        const friendRequets = await getManager()
          .createQueryBuilder(FriendRequest, "fq")
          .innerJoinAndSelect(
            "fq.sender",
            "sender",
            "fq.isAccepted = :isAccepted",
            { isAccepted: false }
          )
          .where("fq.receiver = :receiver", { receiver: ctx.user.id })
          .select(["fq.id", "sender.email"])
          .getMany();

        return friendRequets.map(fr => ({
          id: fr.id,
          senderEmail: fr.sender.email
        }));
      } catch (error) {
        console.error(error);
        return;
      }
    }
  },
  Mutation: {
    sendFriendRequest: async (_, { userId }, ctx) => {
      try {
        if (ctx.user.id === userId) {
          throw new Error();
        }
        const userToSend = await User.findOne({ id: userId });
        if (!userToSend) {
          throw new Error();
        }

        const [isExist] = await getManager().query(
          `SELECT *
            FROM friend_request AS fq
            WHERE ( fq.senderId = ? AND fq.receiverId = ? ) OR ( fq.senderId = ? AND fq.receiverId = ?  )
          `,
          [ctx.user.id, userId, userId, ctx.user.id]
        );

        if (isExist) {
          throw new Error();
        }

        const friendRequest = FriendRequest.create({
          receiver: userToSend,
          sender: ctx.user
        });
        await friendRequest.save();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    acceptFriendRequest: async (_, { friendRequestId }, ctx) => {
      try {
        const friendRequest = await getManager()
          .createQueryBuilder(FriendRequest, "fq")
          .where("fq.id = :id", { id: friendRequestId })
          .andWhere("fq.receiver = :receiver", { receiver: ctx.user.id })
          .getOne();

        if (!friendRequest) {
          throw new Error();
        }

        friendRequest.isAccepted = true;
        await friendRequest.save();

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  }
};
