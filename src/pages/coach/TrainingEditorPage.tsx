import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrainingTypes } from '../../hooks/useTrainingTypes'
import { useStudentDetail } from '../../hooks/useStudentDetail'
import { useTrainingEditorData, useSaveTraining } from '../../hooks/useTrainingEditor'
import type { EditableExercise, EditableWarmupItem } from '../../hooks/useTrainingEditor'
import { useLibraryExercises, useWarmupTemplates } from '../../hooks/useLibrary'
import { HoldIcon } from '../../components/ui/HoldIcon'
import { Icon } from '../../components/ui/Icon'
import { CoachTabBar } from '../../components/coach/CoachTabBar'
import type { TrainingTypeId } from '../../lib/database.types'

const NON_FUN_TYPE_ORDER: TrainingTypeId[] = ['sila', 'zfp', 'tech', 'coord', 'end']
const DOW_NAMES = ['неділю', 'понеділок', 'вівторок', 'середу', 'четвер', "п'ятницю", 'суботу']
const MONTHS_GEN = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
]

function newKey() {
  return crypto.randomUUID()
}

export function TrainingEditorPage() {
  const { studentId = '', date = '' } = useParams()
  const navigate = useNavigate()

  const { data: student } = useStudentDetail(studentId)
  const { data: types } = useTrainingTypes()
  const { data: editorData, isLoading } = useTrainingEditorData(studentId, date)
  const { data: libraryExercises } = useLibraryExercises()
  const { data: templates } = useWarmupTemplates()
  const saveTraining = useSaveTraining(studentId, date, editorData?.training?.id ?? null)

  const [typeId, setTypeId] = useState<TrainingTypeId>('sila')
  const [warmupItems, setWarmupItems] = useState<EditableWarmupItem[]>([])
  const [exercises, setExercises] = useState<EditableExercise[]>([])
  const [showLibraryPicker, setShowLibraryPicker] = useState(false)
  const hydrated = useRef(false)

  useEffect(() => {
    if (!editorData || hydrated.current) return
    hydrated.current = true
    if (editorData.training) setTypeId(editorData.training.type_id)
    setWarmupItems(editorData.warmupItems)
    setExercises(editorData.exercises)
  }, [editorData])

  const orderedTypes = (types ?? [])
    .filter((t) => NON_FUN_TYPE_ORDER.includes(t.id))
    .sort((a, b) => NON_FUN_TYPE_ORDER.indexOf(a.id) - NON_FUN_TYPE_ORDER.indexOf(b.id))

  const matchingTemplate = templates?.find((t) => t.type_id === typeId)
  const matchingLibraryExercises = (libraryExercises ?? []).filter((e) => e.type_id === typeId)

  function applyTemplate() {
    if (!matchingTemplate) return
    setWarmupItems(matchingTemplate.items.map((text) => ({ key: newKey(), text })))
  }

  function updateWarmupText(key: string, text: string) {
    setWarmupItems((items) => items.map((i) => (i.key === key ? { ...i, text } : i)))
  }

  function removeWarmup(key: string) {
    setWarmupItems((items) => items.filter((i) => i.key !== key))
  }

  function addWarmup() {
    setWarmupItems((items) => [...items, { key: newKey(), text: '' }])
  }

  function addManualExercise() {
    setExercises((ex) => [...ex, { key: newKey(), title: '', description: '', videoUrl: '', libraryExerciseId: null }])
  }

  function addFromLibrary(libId: string) {
    const lib = matchingLibraryExercises.find((e) => e.id === libId)
    if (!lib) return
    setExercises((ex) => [
      ...ex,
      {
        key: newKey(),
        title: lib.title,
        description: lib.description ?? '',
        videoUrl: lib.video_url ?? '',
        libraryExerciseId: lib.id,
      },
    ])
    setShowLibraryPicker(false)
  }

  function updateExercise(key: string, patch: Partial<EditableExercise>) {
    setExercises((ex) => ex.map((e) => (e.key === key ? { ...e, ...patch } : e)))
  }

  function removeExercise(key: string) {
    setExercises((ex) => ex.filter((e) => e.key !== key))
  }

  async function handleSave() {
    await saveTraining.mutateAsync({ typeId, warmupItems, exercises })
    navigate(`/coach/students/${studentId}`)
  }

  if (isLoading || !student || !types) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const dw = DOW_NAMES[dateObj.getDay()]

  return (
    <div className="screen">
      <div className="screen-body">
      <div className="ed-top">
        <button className="round-btn" aria-label="Назад" onClick={() => navigate(`/coach/students/${studentId}`)}>
          <Icon name="back" />
        </button>
      </div>

      <div className="ed-date">
        <div className="dw">
          {student.full_name}, {dw}
        </div>
        <h2 className="h-big">
          {d} {MONTHS_GEN[m - 1]}
        </h2>
      </div>

      <div className="sec-title" style={{ paddingTop: 20, paddingBottom: 0 }}>
        <h3>Тип тренування</h3>
      </div>
      <div className="type-pick" role="group" aria-label="Тип тренування">
        {orderedTypes.map((t) => (
          <button key={t.id} type="button" aria-pressed={t.id === typeId} onClick={() => setTypeId(t.id)}>
            <HoldIcon holdShape={t.hold_shape} color={t.id === typeId ? 'var(--paper)' : t.color} />
            {t.name}
          </button>
        ))}
      </div>

      <div className="sec-title">
        <h3>Розминка</h3>
        <span>{warmupItems.length} пунктів</span>
      </div>
      {matchingTemplate && (
        <button className="tpl-chip" type="button" onClick={applyTemplate}>
          <span>
            Шаблон: <em>{matchingTemplate.title}</em>
          </span>
          <Icon name="down" />
        </button>
      )}
      <ul className="ed-list">
        {warmupItems.map((w) => (
          <li key={w.key}>
            <input
              value={w.text}
              placeholder="Пункт розминки"
              aria-label="Пункт розминки"
              onChange={(e) => updateWarmupText(w.key, e.target.value)}
            />
            <button className="del" aria-label="Видалити пункт" onClick={() => removeWarmup(w.key)}>
              <Icon name="x" />
            </button>
          </li>
        ))}
        <li style={{ padding: 0 }}>
          <button className="add-row" onClick={addWarmup}>
            <Icon name="plus" />
            Додати пункт
          </button>
        </li>
      </ul>

      <div className="sec-title">
        <h3>Основна частина</h3>
        <span>{exercises.length} вправ</span>
      </div>

      {exercises.map((ex, i) => (
        <div className="ex-edit" key={ex.key}>
          <div className="top">
            <span className="ex-num">{i + 1}</span>
            <input
              value={ex.title}
              placeholder="Назва вправи"
              aria-label="Назва вправи"
              onChange={(e) => updateExercise(ex.key, { title: e.target.value })}
            />
            <button className="del" aria-label="Видалити вправу" onClick={() => removeExercise(ex.key)}>
              <Icon name="trash" />
            </button>
          </div>
          <textarea
            rows={2}
            aria-label="Опис вправи"
            placeholder="Підходи, повтори, вага, відпочинок..."
            value={ex.description}
            onChange={(e) => updateExercise(ex.key, { description: e.target.value })}
          />
          <label className="link">
            <Icon name="play" />
            <input
              placeholder="Посилання на відео (необов'язково)"
              aria-label="Посилання на відео"
              value={ex.videoUrl}
              onChange={(e) => updateExercise(ex.key, { videoUrl: e.target.value })}
            />
          </label>
        </div>
      ))}

      {showLibraryPicker && (
        <ul className="tpl-list">
          {matchingLibraryExercises.length === 0 && (
            <li style={{ padding: '0 0 8px', color: 'var(--muted)', fontSize: 13 }}>
              У бібліотеці немає вправ цього типу
            </li>
          )}
          {matchingLibraryExercises.map((lib) => (
            <li key={lib.id}>
              <button className="tpl" type="button" onClick={() => addFromLibrary(lib.id)}>
                <HoldIcon
                  holdShape={orderedTypes.find((t) => t.id === lib.type_id)?.hold_shape ?? 'h0'}
                  color={orderedTypes.find((t) => t.id === lib.type_id)?.color ?? '#000'}
                  className="hd"
                />
                <span>
                  <strong>{lib.title}</strong>
                  <small>{lib.description}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="two-btn">
        <button className="dark" onClick={() => setShowLibraryPicker((v) => !v)}>
          <Icon name="lib" />З бібліотеки
        </button>
        <button className="ghost" onClick={addManualExercise}>
          <Icon name="plus" />
          Вручну
        </button>
      </div>

      <div className="save-wrap">
        <button className="btn-main" onClick={handleSave} disabled={saveTraining.isPending}>
          <Icon name="save" />
          {saveTraining.isPending ? 'Зберігаю…' : 'Зберегти тренування'}
        </button>
      </div>
      </div>

      <CoachTabBar />
    </div>
  )
}
