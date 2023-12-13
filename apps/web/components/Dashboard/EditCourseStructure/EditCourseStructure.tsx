'use client';
import { getAPIUrl } from '@services/config/config';
import { revalidateTags, swrFetcher } from '@services/utils/ts/requests';
import React, { useContext, useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useSWR, { mutate } from 'swr';
import ChapterElement from './DraggableElements/ChapterElement';
import PageLoading from '@components/Objects/Loaders/PageLoading';
import { updateCourseOrderStructure } from '@services/courses/chapters';
import { useRouter } from 'next/navigation';
import { CourseStructureContext } from 'app/orgs/[orgslug]/dash/courses/course/[courseuuid]/[subpage]/page';
import { useCourse, useCourseDispatch } from '@components/Dashboard/CourseContext';

type EditCourseStructureProps = {
    orgslug: string,
    course_uuid?: string,
}

export type OrderPayload = {
    chapter_order_by_ids: [
        {
            chapter_id: string,
            activities_order_by_ids: [
                {
                    activity_id: string
                }
            ]
        }
    ],
} | undefined

const EditCourseStructure = (props: EditCourseStructureProps) => {
    const router = useRouter();
    // Check window availability
    const [winReady, setwinReady] = useState(false);

    const dispatchCourse = useCourseDispatch() as any;

    const [order, setOrder] = useState<OrderPayload>();
    const course = useCourse() as any;
    const course_structure = course ? course.courseStructure : {};
    const course_uuid = course ? course.courseStructure.course_uuid : '';



    const updateStructure = (result: any) => {
        const { destination, source, draggableId, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        if (type === 'chapter') {
            const newChapterOrder = Array.from(course_structure.chapters);
            newChapterOrder.splice(source.index, 1);
            newChapterOrder.splice(destination.index, 0, course_structure.chapters[source.index]);
            dispatchCourse({ type: 'setCourseStructure', payload: { ...course_structure, chapters: newChapterOrder } })
            dispatchCourse({ type: 'setIsNotSaved' })
        }
        if (type === 'activity') {
            const newChapterOrder = Array.from(course_structure.chapters);
            const sourceChapter = newChapterOrder.find((chapter: any) => chapter.chapter_uuid === source.droppableId) as any;
            const destinationChapter = newChapterOrder.find((chapter: any) => chapter.chapter_uuid === destination.droppableId) ? newChapterOrder.find((chapter: any) => chapter.chapter_uuid === destination.droppableId) : sourceChapter;
            const activity = sourceChapter.activities.find((activity: any) => activity.activity_uuid === draggableId);
            sourceChapter.activities.splice(source.index, 1);
            destinationChapter.activities.splice(destination.index, 0, activity);
            dispatchCourse({ type: 'setCourseStructure', payload: { ...course_structure, chapters: newChapterOrder } })
            dispatchCourse({ type: 'setIsNotSaved' })
        }
    }

    useEffect(() => {
        setwinReady(true);

    }, [props.course_uuid, course_structure, course]);


    if (!course) return <PageLoading></PageLoading>

    return (
        <div className='flex flex-col'>
            {winReady ?
                <DragDropContext onDragEnd={updateStructure}>
                    <Droppable type='chapter' droppableId='chapters'>
                        {(provided) => (
                            <div
                                className='space-y-4'
                                {...provided.droppableProps}
                                ref={provided.innerRef}>
                                {course_structure.chapters && course_structure.chapters.map((chapter: any, index: any) => {
                                    return (

                                        <ChapterElement
                                            key={chapter.chapter_uuid}
                                            chapterIndex={index}
                                            orgslug={props.orgslug}
                                            course_uuid={course_uuid}
                                            chapter={chapter} />
                                    )
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                : <></>}
        </div>


    )
}

export default EditCourseStructure