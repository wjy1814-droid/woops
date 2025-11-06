const express = require('express');
const router = express.Router();
const pool = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 모든 그룹 라우트에 인증 필요
router.use(authenticateToken);

// 내 그룹 목록 조회
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                g.id,
                g.name,
                g.description,
                g.owner_id,
                u.username AS owner_name,
                g.created_at,
                gm.role AS my_role,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            JOIN users u ON g.owner_id = u.id
            WHERE gm.user_id = $1
            ORDER BY g.created_at DESC
        `, [req.userId]);
        
        res.json({ groups: result.rows });
    } catch (error) {
        console.error('그룹 목록 조회 오류:', error);
        res.status(500).json({ error: '그룹 목록을 불러올 수 없습니다.' });
    }
});

// 그룹 생성
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: '그룹 이름을 입력해주세요.' });
        }
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const groupResult = await client.query(
                'INSERT INTO groups (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
                [name, description || '', req.userId]
            );
            
            const group = groupResult.rows[0];
            
            await client.query(
                'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
                [group.id, req.userId, 'owner']
            );
            
            await client.query('COMMIT');
            
            res.status(201).json({ message: '그룹이 생성되었습니다.', group });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('그룹 생성 오류:', error);
        res.status(500).json({ error: '그룹 생성에 실패했습니다.' });
    }
});

// 그룹 삭제
router.delete('/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const memberResult = await pool.query(
            'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, req.userId]
        );
        
        if (memberResult.rows.length === 0 || memberResult.rows[0].role !== 'owner') {
            return res.status(403).json({ error: '그룹을 삭제할 권한이 없습니다.' });
        }
        
        await pool.query('DELETE FROM groups WHERE id = $1', [groupId]);
        
        res.json({ message: '그룹이 삭제되었습니다.' });
    } catch (error) {
        console.error('그룹 삭제 오류:', error);
        res.status(500).json({ error: '그룹 삭제에 실패했습니다.' });
    }
});

module.exports = router;

