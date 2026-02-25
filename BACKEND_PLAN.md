# CauseConnect - Backend MVP Plan

## Goal
Build a minimal backend in 2-3 weeks so mobile development can start immediately.

**Principle**: PostgreSQL only. No Neo4j, no Kafka, no over-engineering.

---

## Phase 1: Foundation (Week 1)

**Day 1-5: Users & Auth**
- User entity: id, email, name, bio, avatarUrl
- WorkOS JWT validation (already started)
- Endpoints: GET /users/me, PATCH /users/me, GET /users/:id

---

## Phase 2: Social (Week 2)

**Day 1-2: Follows**
- Table: follows(follower_id, following_id)
- Endpoints: POST/DELETE /users/:id/follow

**Day 3-5: Posts & Feed**
- Post entity: id, userId, groupId, content
- Personal feed: posts from followed users
- Endpoints: GET /feed, POST /posts, DELETE /posts/:id

---

## Phase 3: Groups + Q&A + Skills (Week 3)

**Day 1-2: Groups (Simple)**
- Group: id, name, description, creatorId, memberCount
- Membership tracking
- Endpoints: POST /groups, GET /groups/:id, POST /groups/:id/join

**Day 3-4: Q&A**
- Question: title, content, tags, voteCount, answerCount
- Answer: content, isAccepted, voteCount
- Voting system
- Endpoints: questions CRUD, answers, accept, votes

**Day 5: Skills**
- 10 predefined skills
- User self-rating (1-5)
- Onboarding quiz (optional)
- Endpoints: GET /skills, POST /users/me/skills

---

## Database Tables

```
users (id, email, name, bio, avatar_url)
follows (follower_id, following_id)
groups (id, name, description, creator_id, member_count)
group_memberships (group_id, user_id)
posts (id, user_id, group_id, content)
questions (id, user_id, title, content, tags, vote_count, answer_count)
answers (id, question_id, user_id, content, is_accepted, vote_count)
votes (id, user_id, target_type, target_id, value)
skills (id, name, description)
user_skills (user_id, skill_id, self_rating)
```

---

## API Summary

**Users**: GET /users/me, PATCH /users/me, GET /users/:id  
**Social**: POST/DELETE /follows, GET /feed, POST/DELETE /posts  
**Groups**: POST/GET /groups, POST /groups/:id/join, GET /groups/:id/posts  
**Q&A**: GET/POST /questions, POST /answers, POST /votes  
**Skills**: GET /skills, POST /users/me/skills

---

## Removed for Later

- Neo4j graph database
- Kafka event streaming
- Portfolio PDF export
- Resource curation
- Mentorship matching
- Advanced gamification (badges, streaks)
- Notifications service

---

## Success Criteria

Mobile dev can:
1. Authenticate with WorkOS
2. View/update profile
3. Follow/unfollow users
4. Create/view posts
5. Join groups and post in them
6. Ask/answer questions and vote
7. Set skills during onboarding

**Target**: 2-3 weeks to mobile-ready
