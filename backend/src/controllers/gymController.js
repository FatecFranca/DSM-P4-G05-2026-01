import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export const createGym = async (req, res) => {
    const { name, address, phone, capacity } = req.body
    try {
        const gym = await prisma.gym.create({
            data: { name, address, phone, capacity, occupancy: 0 }
        })
        res.status(201).json(gym)
    } catch (error) {
        res.status(500).json({ message: 'Error creating gym, Gym already exists', error: error.message })
    }
}
export const getGyms = async (req, res) => {
    const gyms = await prisma.gym.findMany()
    res.json(gyms)
}
export const deleteGym = async (req, res) => {
    const { id } = req.params
    try {
        await prisma.gym.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        res.status(404).json({ message: 'Gym not found' })
    }
}