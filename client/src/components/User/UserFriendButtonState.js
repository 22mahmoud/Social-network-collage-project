import React from 'react';
import { Button, Card } from 'semantic-ui-react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';

import { GET_USER_QUERY } from '../../routes/Search';

const SEND_FRRIEND_REQUEST_MUTATION = gql`
  mutation($userId: String!) {
    sendFriendRequest(userId: $userId)
  }
`;

const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
  mutation($friendRequestId: String!) {
    acceptFriendRequest(friendRequestId: $friendRequestId)
  }
`;

const UserFriendButtonState = ({
  data: {
    heSent, friendRequestId, eQuery, youSent, notYet, id, isFriend,
  },
}) =>
  console.log(isFriend, 'HE') || (
    <ApolloConsumer>
      {client => (
        <Card.Content extra>
          <div className="ui two buttons">
            {heSent && (
              <Button
                color="blue"
                onClick={() => {
                  client.mutate({
                    mutation: ACCEPT_FRIEND_REQUEST_MUTATION,
                    variables: {
                      friendRequestId,
                    },
                    update: (cache, { data: { acceptFriendRequest } }) => {
                      const { getUser } = cache.readQuery({
                        query: GET_USER_QUERY,
                        variables: {
                          email: eQuery,
                        },
                      });
                      cache.writeQuery({
                        query: GET_USER_QUERY,
                        data: {
                          getUser: {
                            ...getUser,
                            heSent: false,
                            isFriend: acceptFriendRequest,
                          },
                        },
                      });
                    },
                  });
                }}
                floated="right"
              >
                Accept friend request
              </Button>
            )}
            {youSent && (
              <Button floated="right" color="blue">
                friend request sent
              </Button>
            )}
            {notYet && (
              <Button
                onClick={() => {
                  client.mutate({
                    mutation: SEND_FRRIEND_REQUEST_MUTATION,
                    variables: {
                      userId: id,
                    },
                    update: (cache, { data: { sendFriendRequest } }) => {
                      const { getUser } = cache.readQuery({
                        query: GET_USER_QUERY,
                        variables: {
                          email: eQuery,
                        },
                      });

                      cache.writeQuery({
                        query: GET_USER_QUERY,
                        data: {
                          getUser: {
                            ...getUser,
                            notYet: false,
                            youSent: sendFriendRequest,
                          },
                        },
                      });
                    },
                  });
                }}
                floated="right"
              >
                Add
              </Button>
            )}
            {isFriend && (
              <Button floated="right" color="green">
                <span role="img"> {'👍'} </span> Friends
              </Button>
            )}
          </div>
        </Card.Content>
      )}
    </ApolloConsumer>
  );

export default UserFriendButtonState;
